from typing import Optional, List
from pydantic import BaseModel
import uuid
from datetime import datetime


class MessageRead(BaseModel):
    id: uuid.UUID
    direction: str
    content: str
    message_type: str
    ai_stage: Optional[str]
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationRead(BaseModel):
    id: uuid.UUID
    customer_phone: str
    status: str
    unread_count: str
    customer_id: Optional[uuid.UUID]
    messages: List[MessageRead] = []
    created_at: datetime

    model_config = {"from_attributes": True}
