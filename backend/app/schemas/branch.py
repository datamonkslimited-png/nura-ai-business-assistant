from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime


class BranchCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_main: bool = False
    opening_hours: Optional[str] = None


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    is_main: Optional[bool] = None
    opening_hours: Optional[str] = None


class BranchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool
    is_main: bool
    opening_hours: Optional[str] = None
    created_at: datetime
