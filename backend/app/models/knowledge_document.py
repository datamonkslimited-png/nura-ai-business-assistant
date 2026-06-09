from sqlalchemy import Column, String, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class KnowledgeDocument(Base, TimestampMixin):
    __tablename__ = "knowledge_documents"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    doc_type = Column(String(50), default="faq")  # faq | policy | product | delivery | hours | general
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
