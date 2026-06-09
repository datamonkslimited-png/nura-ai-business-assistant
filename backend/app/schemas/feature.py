from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime


class FeatureRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    key: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool
    created_at: datetime


class TemplateFeatureRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feature: FeatureRead


class TemplateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    key: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool
    feature_assignments: List[TemplateFeatureRead] = []
    created_at: datetime


class TenantFeatureUpdate(BaseModel):
    enabled: bool


class AssignTemplateRequest(BaseModel):
    template_key: str
