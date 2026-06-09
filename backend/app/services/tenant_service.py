from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.tenant import Tenant, TenantUser


class TenantService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, tenant_id: UUID) -> Optional[Tenant]:
        result = await self.db.execute(select(Tenant).where(Tenant.id == tenant_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Tenant]:
        result = await self.db.execute(select(Tenant).where(Tenant.slug == slug))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Tenant:
        tenant = Tenant(**data)
        self.db.add(tenant)
        await self.db.flush()
        return tenant

    async def update(self, tenant_id: UUID, data: dict) -> Optional[Tenant]:
        await self.db.execute(
            update(Tenant).where(Tenant.id == tenant_id).values(**data)
        )
        return await self.get_by_id(tenant_id)

    async def list_all(self, limit: int = 50, offset: int = 0) -> List[Tenant]:
        result = await self.db.execute(
            select(Tenant).order_by(Tenant.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def get_user_by_supabase_id(self, supabase_id: str) -> Optional[TenantUser]:
        result = await self.db.execute(
            select(TenantUser).where(TenantUser.supabase_user_id == supabase_id)
        )
        return result.scalar_one_or_none()

    async def create_user(self, data: dict) -> TenantUser:
        user = TenantUser(**data)
        self.db.add(user)
        await self.db.flush()
        return user
