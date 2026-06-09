from typing import List
from uuid import UUID
from datetime import datetime, timedelta, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.order import Order, OrderStatus
from app.models.message import Message, MessageDirection
from app.models.customer import Customer
from app.models.tenant import Tenant, TenantStatus
from app.models.subscription import Subscription
from app.models.ai_usage_log import AiUsageLog


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self, tenant_id: UUID) -> dict:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        thirty_days_ago = now - timedelta(days=30)

        messages_today = (await self.db.execute(
            select(func.count()).where(
                Message.tenant_id == tenant_id,
                Message.direction == MessageDirection.inbound,
                Message.created_at >= today_start,
            )
        )).scalar_one()

        messages_yesterday = (await self.db.execute(
            select(func.count()).where(
                Message.tenant_id == tenant_id,
                Message.direction == MessageDirection.inbound,
                Message.created_at >= yesterday_start,
                Message.created_at < today_start,
            )
        )).scalar_one()

        orders_today = (await self.db.execute(
            select(func.count()).where(
                Order.tenant_id == tenant_id,
                Order.created_at >= today_start,
            )
        )).scalar_one()

        orders_yesterday = (await self.db.execute(
            select(func.count()).where(
                Order.tenant_id == tenant_id,
                Order.created_at >= yesterday_start,
                Order.created_at < today_start,
            )
        )).scalar_one()

        revenue_today = (await self.db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(
                Order.tenant_id == tenant_id,
                Order.status != OrderStatus.cancelled,
                Order.created_at >= today_start,
            )
        )).scalar_one()

        revenue_yesterday = (await self.db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(
                Order.tenant_id == tenant_id,
                Order.status != OrderStatus.cancelled,
                Order.created_at >= yesterday_start,
                Order.created_at < today_start,
            )
        )).scalar_one()

        active_customers = (await self.db.execute(
            select(func.count(func.distinct(Message.conversation_id))).where(
                Message.tenant_id == tenant_id,
                Message.created_at >= thirty_days_ago,
            )
        )).scalar_one()

        def pct_change(current: int, previous: int) -> float:
            if previous == 0:
                return 100.0 if current > 0 else 0.0
            return round((current - previous) / previous * 100, 1)

        return {
            "messages_today": messages_today,
            "orders_today": orders_today,
            "revenue_today": int(revenue_today),
            "active_customers": active_customers,
            "messages_change_pct": pct_change(messages_today, messages_yesterday),
            "orders_change_pct": pct_change(orders_today, orders_yesterday),
            "revenue_change_pct": pct_change(int(revenue_today), int(revenue_yesterday)),
        }

    async def get_revenue_series(self, tenant_id: UUID, days: int = 7) -> List[dict]:
        now = datetime.now(timezone.utc)
        since = now - timedelta(days=days)

        result = await self.db.execute(
            select(
                func.date(Order.created_at).label("day"),
                func.coalesce(func.sum(Order.total), 0).label("revenue"),
            ).where(
                Order.tenant_id == tenant_id,
                Order.status != OrderStatus.cancelled,
                Order.created_at >= since,
            ).group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at).asc())
        )
        rows = result.fetchall()

        # Fill in missing days with zero
        revenue_by_date = {str(r.day): int(r.revenue) for r in rows}
        series = []
        for i in range(days):
            day = (since + timedelta(days=i + 1)).date()
            series.append({"date": str(day), "revenue": revenue_by_date.get(str(day), 0)})
        return series

    async def get_admin_stats(self) -> dict:
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_tenants = (await self.db.execute(select(func.count()).select_from(Tenant))).scalar_one()
        active_tenants = (await self.db.execute(
            select(func.count()).where(Tenant.status == TenantStatus.active)
        )).scalar_one()
        mrr = (await self.db.execute(
            select(func.coalesce(func.sum(Subscription.amount_kshs), 0))
            .where(Subscription.status == "active")
        )).scalar_one()
        total_ai_calls = (await self.db.execute(select(func.count()).select_from(AiUsageLog))).scalar_one()
        new_this_month = (await self.db.execute(
            select(func.count()).where(Tenant.created_at >= month_start)
        )).scalar_one()

        return {
            "total_tenants": total_tenants,
            "active_tenants": active_tenants,
            "mrr_kshs": int(mrr),
            "total_ai_calls": total_ai_calls,
            "new_tenants_this_month": new_this_month,
        }
