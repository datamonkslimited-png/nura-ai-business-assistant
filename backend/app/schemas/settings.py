from typing import Optional
from pydantic import BaseModel, ConfigDict


class TenantSettings(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ai_tone: Optional[str] = None
    ai_language: Optional[str] = None
    ai_custom_instructions: Optional[str] = None
    wa_connected: bool = False
    mpesa_live: bool = False
    country: Optional[str] = None
    currency: Optional[str] = None


class TenantSettingsUpdate(BaseModel):
    ai_tone: Optional[str] = None
    ai_language: Optional[str] = None
    ai_custom_instructions: Optional[str] = None
    wa_connected: Optional[bool] = None
    mpesa_live: Optional[bool] = None
    country: Optional[str] = None
    currency: Optional[str] = None
