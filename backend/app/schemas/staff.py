from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime


class StaffCreate(BaseModel):
    tenant_id: Optional[uuid.UUID] = None
    branch_id: Optional[uuid.UUID] = None
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str = "staff"


class StaffUpdate(BaseModel):
    branch_id: Optional[uuid.UUID] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    avatar_url: Optional[str] = None


class StaffRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    branch_id: Optional[uuid.UUID] = None
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
