from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    plan: str
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    amount_kshs: int
    created_at: datetime


class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = None
    status: Optional[str] = None
    amount_kshs: Optional[int] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
