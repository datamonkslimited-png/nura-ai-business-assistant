from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.customer import Customer


class CustomerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, tenant_id: UUID, search: str = "", limit: int = 20, offset: int = 0) -> Tuple[List[Customer], int]:
        q = select(Customer).where(Customer.tenant_id == tenant_id)
        if search:
            q = q.where(Customer.name.ilike(f"%{search}%") | Customer.phone.ilike(f"%{search}%"))
        
        count_q = select(func.count()).select_from(q.subquery())
        total_result = await self.db.execute(count_q)
        total = total_result.scalar_one()

        q = q.order_by(Customer.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(q)
        return list(result.scalars().all()), total

    async def get(self, tenant_id: UUID, customer_id: UUID) -> Optional[Customer]:
        result = await self.db.execute(
            select(Customer).where(Customer.tenant_id == tenant_id, Customer.id == customer_id)
        )
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, data: dict) -> Customer:
        customer = Customer(tenant_id=tenant_id, **data)
        self.db.add(customer)
        await self.db.flush()
        return customer

    async def update(self, tenant_id: UUID, customer_id: UUID, data: dict) -> Optional[Customer]:
        await self.db.execute(
            update(Customer)
            .where(Customer.tenant_id == tenant_id, Customer.id == customer_id)
            .values(**data)
        )
        return await self.get(tenant_id, customer_id)

    async def delete(self, tenant_id: UUID, customer_id: UUID) -> bool:
        customer = await self.get(tenant_id, customer_id)
        if not customer:
            return False
        await self.db.delete(customer)
        return True
