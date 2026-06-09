from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.models.order import Order, OrderStatus
from app.models.customer import Customer
from app.models.booking import Booking
from app.models.message import Message
import uuid

router = APIRouter()


@router.get("/overview")
async def overview(
    days: int = Query(30, ge=1, le=365),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    total_orders = (await db.execute(
        select(func.count()).where(Order.tenant_id == tid, Order.created_at >= since)
    )).scalar_one()

    revenue = (await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.tenant_id == tid, Order.status == OrderStatus.delivered, Order.created_at >= since)
    )).scalar_one()

    total_customers = (await db.execute(
        select(func.count()).where(Customer.tenant_id == tid)
    )).scalar_one()

    new_customers = (await db.execute(
        select(func.count()).where(Customer.tenant_id == tid, Customer.created_at >= since)
    )).scalar_one()

    total_bookings = (await db.execute(
        select(func.count()).where(Booking.tenant_id == tid, Booking.created_at >= since)
    )).scalar_one()

    total_messages = (await db.execute(
        select(func.count()).where(Message.tenant_id == tid, Message.created_at >= since)
    )).scalar_one()

    return {
        "period_days": days,
        "orders": total_orders,
        "revenue_kes": revenue,
        "customers_total": total_customers,
        "customers_new": new_customers,
        "bookings": total_bookings,
        "messages": total_messages,
    }


@router.get("/revenue-chart")
async def revenue_chart(
    days: int = Query(30, ge=7, le=90),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Daily revenue for the past N days."""
    tid = uuid.UUID(tenant_id)
    result = await db.execute(text("""
        SELECT DATE(created_at AT TIME ZONE 'Africa/Nairobi') as day,
               COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE tenant_id = :tid
          AND status = 'delivered'
          AND created_at >= NOW() - INTERVAL ':days days'
        GROUP BY day
        ORDER BY day ASC
    """), {"tid": str(tid), "days": days})
    rows = result.fetchall()
    return [{"date": str(r.day), "revenue": int(r.revenue)} for r in rows]
