from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.models.message import Conversation, Message, ConversationStatus
from app.schemas.message import ConversationRead
import uuid

router = APIRouter()


@router.get("/conversations")
async def list_conversations(
    status: str = Query(""),
    limit: int = Query(30, ge=1, le=100),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    q = select(Conversation).where(Conversation.tenant_id == tid)
    if status:
        q = q.where(Conversation.status == status)
    result = await db.execute(q.order_by(Conversation.updated_at.desc()).limit(limit))
    return list(result.scalars().all())


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    result = await db.execute(
        select(Conversation).where(Conversation.tenant_id == tid, Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()


@router.patch("/conversations/{conversation_id}/assign")
async def assign_conversation(
    conversation_id: uuid.UUID,
    status: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    await db.execute(
        update(Conversation)
        .where(Conversation.tenant_id == tid, Conversation.id == conversation_id)
        .values(status=status)
    )
    await db.commit()
    return {"updated": True}
