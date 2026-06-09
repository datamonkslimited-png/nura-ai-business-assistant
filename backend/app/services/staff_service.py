from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.staff import Staff


class StaffService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, tenant_id: UUID, branch_id: Optional[UUID] = None) -> List[Staff]:
        q = select(Staff).where(Staff.tenant_id == tenant_id)
        if branch_id is not None:
            q = q.where(Staff.branch_id == branch_id)
        result = await self.db.execute(q.order_by(Staff.full_name.asc()))
        return list(result.scalars().all())

    async def get(self, tenant_id: UUID, staff_id: UUID) -> Optional[Staff]:
        result = await self.db.execute(
            select(Staff).where(Staff.id == staff_id, Staff.tenant_id == tenant_id)
        )
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, data: dict) -> Staff:
        data.pop("tenant_id", None)
        member = Staff(tenant_id=tenant_id, **data)
        self.db.add(member)
        await self.db.flush()
        return member

    async def update(self, tenant_id: UUID, staff_id: UUID, data: dict) -> Optional[Staff]:
        await self.db.execute(
            update(Staff)
            .where(Staff.id == staff_id, Staff.tenant_id == tenant_id)
            .values(**data)
        )
        return await self.get(tenant_id, staff_id)

    async def delete(self, tenant_id: UUID, staff_id: UUID) -> bool:
        member = await self.get(tenant_id, staff_id)
        if not member:
            return False
        await self.db.delete(member)
        return True
