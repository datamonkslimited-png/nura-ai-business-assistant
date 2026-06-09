from typing import Optional
from pydantic import BaseModel
import uuid
from datetime import datetime


class BookingCreate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    service_name: str
    scheduled_at: datetime
    duration_minutes: int = 60
    price: int = 0
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    service_name: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    price: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class BookingRead(BaseModel):
    id: uuid.UUID
    service_name: str
    scheduled_at: datetime
    duration_minutes: int
    price: int
    status: str
    notes: Optional[str]
    customer_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}
