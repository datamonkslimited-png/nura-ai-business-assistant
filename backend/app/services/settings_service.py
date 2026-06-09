from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.tenant import Tenant


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_tenant_settings(self, tenant_id: UUID) -> Optional[Tenant]:
        result = await self.db.execute(select(Tenant).where(Tenant.id == tenant_id))
        return result.scalar_one_or_none()

    async def update_tenant_settings(self, tenant_id: UUID, data: dict) -> Optional[Tenant]:
        await self.db.execute(
            update(Tenant).where(Tenant.id == tenant_id).values(**data)
        )
        return await self.get_tenant_settings(tenant_id)
