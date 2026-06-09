from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase
from app.models.base import Base, uuid_pk
import uuid as uuid_module
from datetime import datetime
from sqlalchemy import func


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(100), nullable=False)  # e.g. "customer.created"
    resource_type = Column(String(50))
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(Text)  # JSON
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
