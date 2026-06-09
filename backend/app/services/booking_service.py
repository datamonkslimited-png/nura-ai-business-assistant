from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.booking import Booking, BookingStatus


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, tenant_id: UUID, upcoming_only: bool = False, limit: int = 20, offset: int = 0) -> Tuple[List[Booking], int]:
        q = select(Booking).where(Booking.tenant_id == tenant_id)
        if upcoming_only:
            q = q.where(Booking.scheduled_at >= datetime.now(timezone.utc))

        count_q = select(func.count()).select_from(q.subquery())
        total = (await self.db.execute(count_q)).scalar_one()

        result = await self.db.execute(q.order_by(Booking.scheduled_at.asc()).limit(limit).offset(offset))
        return list(result.scalars().all()), total

    async def get(self, tenant_id: UUID, booking_id: UUID) -> Optional[Booking]:
        result = await self.db.execute(
            select(Booking).where(Booking.tenant_id == tenant_id, Booking.id == booking_id)
        )
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, data: dict) -> Booking:
        booking = Booking(tenant_id=tenant_id, **data)
        self.db.add(booking)
        await self.db.flush()
        return booking

    async def update(self, tenant_id: UUID, booking_id: UUID, data: dict) -> Optional[Booking]:
        await self.db.execute(
            update(Booking)
            .where(Booking.tenant_id == tenant_id, Booking.id == booking_id)
            .values(**data)
        )
        return await self.get(tenant_id, booking_id)

    async def cancel(self, tenant_id: UUID, booking_id: UUID) -> Optional[Booking]:
        await self.db.execute(
            update(Booking)
            .where(Booking.tenant_id == tenant_id, Booking.id == booking_id)
            .values(status=BookingStatus.cancelled)
        )
        return await self.get(tenant_id, booking_id)
