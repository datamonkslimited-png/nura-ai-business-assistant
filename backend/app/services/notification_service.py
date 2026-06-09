from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.notification import Notification


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, tenant_id: UUID, unread_only: bool = False) -> List[Notification]:
        q = select(Notification).where(Notification.tenant_id == tenant_id)
        if unread_only:
            q = q.where(Notification.is_read == False)
        result = await self.db.execute(q.order_by(Notification.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, data: dict) -> Notification:
        notification = Notification(**data)
        self.db.add(notification)
        await self.db.flush()
        return notification

    async def mark_read(self, tenant_id: UUID, notification_id: UUID) -> bool:
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id, Notification.tenant_id == tenant_id
            )
        )
        n = result.scalar_one_or_none()
        if not n:
            return False
        await self.db.execute(
            update(Notification)
            .where(Notification.id == notification_id, Notification.tenant_id == tenant_id)
            .values(is_read=True)
        )
        return True

    async def mark_all_read(self, tenant_id: UUID) -> int:
        result = await self.db.execute(
            update(Notification)
            .where(Notification.tenant_id == tenant_id, Notification.is_read == False)
            .values(is_read=True)
        )
        return result.rowcount
