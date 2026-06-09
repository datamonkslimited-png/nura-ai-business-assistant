from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime


class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    notes: Optional[str] = None
    tags: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    wa_opt_in: Optional[bool] = None


class CustomerRead(BaseModel):
    id: uuid.UUID
    name: str
    phone: str
    email: Optional[str]
    notes: Optional[str]
    tags: Optional[str]
    total_orders: int
    total_spent: int
    wa_opt_in: bool
    created_at: datetime

    model_config = {"from_attributes": True}
