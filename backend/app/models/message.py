import enum
from sqlalchemy import Column, String, Text, Boolean, Enum as SAEnum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class MessageDirection(str, enum.Enum):
    inbound = "inbound"
    outbound = "outbound"


class ConversationStatus(str, enum.Enum):
    open = "open"
    bot = "bot"
    human = "human"
    resolved = "resolved"


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True))
    customer_phone = Column(String(20), nullable=False)
    status = Column(SAEnum(ConversationStatus), default=ConversationStatus.bot)
    assigned_to = Column(UUID(as_uuid=True))
    unread_count = Column(String(10), default="0")

    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    conversation_id = Column(UUID(as_uuid=True), nullable=False)
    wa_message_id = Column(String(100))
    direction = Column(SAEnum(MessageDirection), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String(30), default="text")
    ai_stage = Column(String(30))   # deterministic | haiku | sonnet
    is_read = Column(Boolean, default=False)

    __table_args__ = (
        Index(
            "uq_messages_tenant_inbound_wa_message_id",
            "tenant_id",
            "wa_message_id",
            unique=True,
            postgresql_where=wa_message_id.isnot(None) & (direction == MessageDirection.inbound),
        ),
    )

    conversation = relationship("Conversation", back_populates="messages")
