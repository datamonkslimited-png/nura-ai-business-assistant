from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime


class KnowledgeDocumentCreate(BaseModel):
    title: str
    content: str
    doc_type: str = "faq"
    is_active: bool = True
    sort_order: int = 0


class KnowledgeDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    doc_type: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class KnowledgeDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    content: str
    doc_type: str
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
