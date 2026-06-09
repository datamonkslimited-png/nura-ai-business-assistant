from typing import List
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.ai_usage_log import AiUsageLog
from app.models.tenant import Tenant


class AiUsageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log(self, data: dict) -> AiUsageLog:
        entry = AiUsageLog(**data)
        self.db.add(entry)
        await self.db.flush()
        return entry

    async def get_tenant_usage(self, tenant_id: UUID, days: int = 30) -> dict:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        q = select(AiUsageLog).where(
            AiUsageLog.tenant_id == tenant_id,
            AiUsageLog.created_at >= since,
        )

        total_calls = (await self.db.execute(
            select(func.count()).select_from(q.subquery())
        )).scalar_one()

        totals = (await self.db.execute(
            select(
                func.coalesce(func.sum(AiUsageLog.input_tokens + AiUsageLog.output_tokens), 0),
                func.coalesce(func.sum(AiUsageLog.cost_usd_micro), 0),
            ).where(AiUsageLog.tenant_id == tenant_id, AiUsageLog.created_at >= since)
        )).one()

        by_model_result = await self.db.execute(
            select(
                AiUsageLog.model,
                func.count().label("calls"),
                func.coalesce(func.sum(AiUsageLog.input_tokens + AiUsageLog.output_tokens), 0).label("tokens"),
                func.coalesce(func.sum(AiUsageLog.cost_usd_micro), 0).label("cost"),
            ).where(AiUsageLog.tenant_id == tenant_id, AiUsageLog.created_at >= since)
            .group_by(AiUsageLog.model)
        )
        by_model = [
            {"model": r.model, "calls": r.calls, "tokens": int(r.tokens), "cost_usd_micro": int(r.cost)}
            for r in by_model_result.fetchall()
        ]

        return {
            "total_calls": total_calls,
            "total_tokens": int(totals[0]),
            "total_cost_usd_micro": int(totals[1]),
            "by_model": by_model,
        }

    async def get_all_tenants_usage(self, days: int = 30) -> List[dict]:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(
                AiUsageLog.tenant_id,
                func.count().label("calls"),
                func.coalesce(func.sum(AiUsageLog.input_tokens + AiUsageLog.output_tokens), 0).label("tokens"),
                func.coalesce(func.sum(AiUsageLog.cost_usd_micro), 0).label("cost"),
            ).where(AiUsageLog.created_at >= since)
            .group_by(AiUsageLog.tenant_id)
            .order_by(func.count().desc())
        )
        return [
            {
                "tenant_id": str(r.tenant_id),
                "calls": r.calls,
                "tokens": int(r.tokens),
                "cost_usd_micro": int(r.cost),
            }
            for r in result.fetchall()
        ]
