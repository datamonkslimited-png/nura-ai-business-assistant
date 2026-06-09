from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime


class TenantCreate(BaseModel):
    business_name: str
    slug: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    industry: Optional[str] = None


class TenantUpdate(BaseModel):
    business_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    industry: Optional[str] = None
    ai_tone: Optional[str] = None
    ai_language: Optional[str] = None
    ai_custom_instructions: Optional[str] = None


class TenantRead(BaseModel):
    id: uuid.UUID
    business_name: str
    slug: str
    phone: Optional[str]
    email: Optional[str]
    industry: Optional[str]
    plan: str
    status: str
    wa_connected: bool
    ai_tone: str
    ai_language: str
    created_at: datetime

    model_config = {"from_attributes": True}
