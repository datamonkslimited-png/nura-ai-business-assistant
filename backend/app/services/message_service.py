from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.message import Conversation, Message, ConversationStatus


class MessageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_conversations(
        self,
        tenant_id: UUID,
        status: Optional[str] = None,
        page_size: int = 20,
        offset: int = 0,
    ) -> Tuple[List[Conversation], int]:
        q = select(Conversation).where(Conversation.tenant_id == tenant_id)
        if status:
            q = q.where(Conversation.status == status)

        count_q = select(func.count()).select_from(q.subquery())
        total = (await self.db.execute(count_q)).scalar_one()

        result = await self.db.execute(
            q.order_by(Conversation.updated_at.desc()).limit(page_size).offset(offset)
        )
        return list(result.scalars().all()), total

    async def get_conversation(self, tenant_id: UUID, conversation_id: UUID) -> Optional[Conversation]:
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.tenant_id == tenant_id,
                Conversation.id == conversation_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_or_create_conversation(
        self,
        tenant_id: UUID,
        customer_phone: str,
        customer_id: Optional[UUID] = None,
    ) -> Conversation:
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.tenant_id == tenant_id,
                Conversation.customer_phone == customer_phone,
                Conversation.status != ConversationStatus.resolved,
            )
        )
        convo = result.scalar_one_or_none()
        if convo:
            return convo
        convo = Conversation(
            tenant_id=tenant_id,
            customer_phone=customer_phone,
            customer_id=customer_id,
        )
        self.db.add(convo)
        await self.db.flush()
        return convo

    async def list_messages(
        self,
        conversation_id: UUID,
        page_size: int = 50,
        offset: int = 0,
    ) -> List[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(page_size)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def create_message(self, data: dict) -> Message:
        msg = Message(**data)
        self.db.add(msg)
        await self.db.flush()
        return msg

    async def update_conversation_status(
        self, tenant_id: UUID, conversation_id: UUID, status: str
    ) -> Optional[Conversation]:
        await self.db.execute(
            update(Conversation)
            .where(
                Conversation.tenant_id == tenant_id,
                Conversation.id == conversation_id,
            )
            .values(status=status)
        )
        return await self.get_conversation(tenant_id, conversation_id)
