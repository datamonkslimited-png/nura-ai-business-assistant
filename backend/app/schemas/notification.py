from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime


class NotificationCreate(BaseModel):
    tenant_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    title: str
    body: Optional[str] = None
    type: str = "info"
    link: Optional[str] = None


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    body: Optional[str] = None
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime
