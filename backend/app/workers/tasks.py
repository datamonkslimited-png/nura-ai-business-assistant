from __future__ import annotations

import asyncio
from datetime import datetime, timedelta

import pytz
from loguru import logger
from sqlalchemy import select, update

from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks.check_unconfirmed_orders")
def check_unconfirmed_orders():
    """
    Runs every 15 minutes via Celery beat.
    Escalates orders that haven't been confirmed within thresholds:
    - 30 min: send WhatsApp reminder to owner
    - 2 hours: send dashboard notification + email
    - 6 hours: auto-timeout message to customer
    """
    asyncio.run(_check_unconfirmed_orders_async())


async def _check_unconfirmed_orders_async():
    from app.core.database import AsyncSessionLocal
    from app.models.order import Order, OrderStatus
    from app.models.order_escalation import OrderEscalation
    from app.models.tenant import Tenant

    nairobi = pytz.timezone("Africa/Nairobi")
    now = datetime.now(nairobi)

    async with AsyncSessionLocal() as db:
        # Find pending orders
        result = await db.execute(
            select(Order).where(Order.status == OrderStatus.pending)
        )
        orders = result.scalars().all()

        for order in orders:
            # Make created_at timezone-aware for comparison
            created_at = order.created_at
            if created_at.tzinfo is None:
                created_at = pytz.utc.localize(created_at)
            age = now - created_at.astimezone(nairobi)

            # Check existing escalation for this order
            esc_result = await db.execute(
                select(OrderEscalation)
                .where(OrderEscalation.order_id == order.id)
                .order_by(OrderEscalation.created_at.desc())
                .limit(1)
            )
            last_esc = esc_result.scalar_one_or_none()

            # 6 hours → auto-timeout
            if age >= timedelta(hours=6):
                already_timed_out = last_esc and last_esc.stage == "auto_timeout"
                if not already_timed_out:
                    await _escalate_order(db, order, "auto_timeout", now)
                    logger.warning(
                        f"Order {order.id} auto-timed out after {age}. "
                        "Customer will be notified."
                    )

            # 2 hours → dashboard + email
            elif age >= timedelta(hours=2):
                already_dashboard = last_esc and last_esc.stage in ("dashboard", "auto_timeout")
                if not already_dashboard:
                    await _escalate_order(db, order, "dashboard", now)
                    logger.warning(
                        f"Order {order.id} escalated to dashboard+email after {age}."
                    )

            # 30 min → WhatsApp reminder to owner
            elif age >= timedelta(minutes=30):
                already_wa = last_esc and last_esc.stage in (
                    "whatsapp_1", "dashboard", "auto_timeout"
                )
                if not already_wa:
                    await _escalate_order(db, order, "whatsapp_1", now)
                    logger.info(
                        f"Order {order.id} escalated via WhatsApp to owner after {age}."
                    )

        await db.commit()


async def _escalate_order(db, order, stage: str, now: datetime):
    from app.models.order_escalation import OrderEscalation

    esc = OrderEscalation(
        order_id=order.id,
        tenant_id=order.tenant_id,
        stage=stage,
        sent_at=now,
        is_resolved=False,
    )
    db.add(esc)
    await db.flush()

    if stage == "whatsapp_1":
        # TODO: Send WhatsApp message to tenant owner_phone about unconfirmed order
        logger.info(f"[ESCALATION] WhatsApp owner reminder for order {order.id}")
    elif stage == "dashboard":
        # TODO: Create notification record + send email
        logger.info(f"[ESCALATION] Dashboard + email alert for order {order.id}")
    elif stage == "auto_timeout":
        # TODO: Send WhatsApp message to customer that order could not be confirmed
        logger.info(f"[ESCALATION] Auto-timeout message to customer for order {order.id}")


@celery_app.task(name="app.workers.tasks.send_booking_reminders")
def send_booking_reminders():
    """
    Runs every hour.
    Find bookings in next 24 hours and 2 hours that haven't had reminder sent.
    Send WhatsApp template message to customer.
    """
    asyncio.run(_send_booking_reminders_async())


async def _send_booking_reminders_async():
    from app.core.database import AsyncSessionLocal
    from app.models.booking import Booking, BookingStatus
    from app.models.customer import Customer
    from app.models.tenant import Tenant
    from sqlalchemy import and_

    nairobi = pytz.timezone("Africa/Nairobi")
    now = datetime.now(nairobi)
    window_24h_start = now + timedelta(hours=23)
    window_24h_end = now + timedelta(hours=25)
    window_2h_start = now + timedelta(hours=1, minutes=30)
    window_2h_end = now + timedelta(hours=2, minutes=30)

    async with AsyncSessionLocal() as db:
        # Bookings in the next ~24 hours without reminder
        result = await db.execute(
            select(Booking)
            .where(Booking.status == BookingStatus.confirmed)
            .where(Booking.reminder_sent == "no")
            .where(Booking.scheduled_at >= window_24h_start)
            .where(Booking.scheduled_at <= window_24h_end)
        )
        bookings_24h = result.scalars().all()

        for booking in bookings_24h:
            await _send_booking_reminder(db, booking, "24h")

        # Bookings in the next ~2 hours without 2h reminder
        result2 = await db.execute(
            select(Booking)
            .where(Booking.status == BookingStatus.confirmed)
            .where(Booking.reminder_sent != "2h")
            .where(Booking.scheduled_at >= window_2h_start)
            .where(Booking.scheduled_at <= window_2h_end)
        )
        bookings_2h = result2.scalars().all()

        for booking in bookings_2h:
            await _send_booking_reminder(db, booking, "2h")

        await db.commit()


async def _send_booking_reminder(db, booking, reminder_type: str):
    from app.models.customer import Customer
    from app.models.tenant import Tenant

    cust_result = await db.execute(
        select(Customer).where(Customer.id == booking.customer_id)
    )
    customer = cust_result.scalar_one_or_none()
    if not customer:
        return

    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == booking.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        return

    scheduled_str = booking.scheduled_at.strftime("%A %d %B at %I:%M %p")
    label = "tomorrow" if reminder_type == "24h" else "in about 2 hours"

    # TODO: Use WhatsApp template message (requires approved template)
    # For now log the intended message
    msg = (
        f"Hi {customer.name}! This is a reminder about your {booking.service_name} "
        f"appointment {label} ({scheduled_str}). "
        f"Please reply CANCEL if you need to reschedule."
    )
    logger.info(
        f"[REMINDER] {reminder_type} reminder for booking {booking.id} → {customer.phone}: {msg}"
    )

    # Mark reminder as sent
    booking.reminder_sent = reminder_type
    await db.flush()


@celery_app.task(name="app.workers.tasks.reconcile_pending_payments")
def reconcile_pending_payments():
    """Check status of pending STK push payments."""
    logger.info("Running payment reconciliation task")
    asyncio.run(_reconcile_pending_payments_async())


async def _reconcile_pending_payments_async():
    from app.core.database import AsyncSessionLocal
    from app.models.payment import Payment, PaymentStatus

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Payment).where(Payment.status == PaymentStatus.pending)
        )
        payments = result.scalars().all()

        for payment in payments:
            if not payment.mpesa_checkout_id:
                continue
            # TODO: Call mpesa.stk_query(payment.mpesa_checkout_id) and update status
            logger.debug(f"Would reconcile payment {payment.id}")


@celery_app.task(name="app.workers.tasks.send_bulk_campaign")
def send_bulk_campaign(campaign_id: str):
    """Send bulk WhatsApp campaign to customer list."""
    logger.info(f"Running bulk campaign: {campaign_id}")
    # TODO: Load campaign from DB, batch-send messages
