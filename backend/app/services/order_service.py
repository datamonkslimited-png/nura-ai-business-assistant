from typing import Optional, List, Tuple
from uuid import UUID
import uuid as uuid_module
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem, OrderStatus


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _generate_order_number(self) -> str:
        year = datetime.now().year
        suffix = str(uuid_module.uuid4().int)[:5].upper()
        return f"ORD-{year}-{suffix}"

    async def list(self, tenant_id: UUID, status: str = "", limit: int = 20, offset: int = 0) -> Tuple[List[Order], int]:
        q = select(Order).where(Order.tenant_id == tenant_id).options(selectinload(Order.items))
        if status:
            q = q.where(Order.status == status)

        count_q = select(func.count()).select_from(
            select(Order).where(Order.tenant_id == tenant_id).subquery()
        )
        total = (await self.db.execute(count_q)).scalar_one()

        result = await self.db.execute(q.order_by(Order.created_at.desc()).limit(limit).offset(offset))
        return list(result.scalars().all()), total

    async def get(self, tenant_id: UUID, order_id: UUID) -> Optional[Order]:
        result = await self.db.execute(
            select(Order)
            .where(Order.tenant_id == tenant_id, Order.id == order_id)
            .options(selectinload(Order.items))
        )
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, data: dict) -> Order:
        items_data = data.pop("items", [])
        subtotal = sum(i["unit_price"] * i.get("quantity", 1) for i in items_data)

        order = Order(
            tenant_id=tenant_id,
            order_number=self._generate_order_number(),
            subtotal=subtotal,
            total=subtotal,
            **data,
        )
        self.db.add(order)
        await self.db.flush()

        for item in items_data:
            qty = item.get("quantity", 1)
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.get("product_id"),
                product_name=item["product_name"],
                quantity=qty,
                unit_price=item["unit_price"],
                total_price=item["unit_price"] * qty,
            )
            self.db.add(order_item)

        return order

    async def update_status(self, tenant_id: UUID, order_id: UUID, status: str) -> Optional[Order]:
        await self.db.execute(
            update(Order)
            .where(Order.tenant_id == tenant_id, Order.id == order_id)
            .values(status=status)
        )
        return await self.get(tenant_id, order_id)
