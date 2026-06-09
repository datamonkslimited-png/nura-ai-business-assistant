from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.branch import Branch


class BranchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, tenant_id: UUID) -> List[Branch]:
        result = await self.db.execute(
            select(Branch)
            .where(Branch.tenant_id == tenant_id)
            .order_by(Branch.is_main.desc(), Branch.name.asc())
        )
        return list(result.scalars().all())

    async def get(self, tenant_id: UUID, branch_id: UUID) -> Optional[Branch]:
        result = await self.db.execute(
            select(Branch).where(Branch.id == branch_id, Branch.tenant_id == tenant_id)
        )
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, data: dict) -> Branch:
        branch = Branch(tenant_id=tenant_id, **data)
        self.db.add(branch)
        await self.db.flush()
        return branch

    async def update(self, tenant_id: UUID, branch_id: UUID, data: dict) -> Optional[Branch]:
        await self.db.execute(
            update(Branch)
            .where(Branch.id == branch_id, Branch.tenant_id == tenant_id)
            .values(**data)
        )
        return await self.get(tenant_id, branch_id)

    async def delete(self, tenant_id: UUID, branch_id: UUID) -> bool:
        branch = await self.get(tenant_id, branch_id)
        if not branch:
            return False
        await self.db.delete(branch)
        return True
