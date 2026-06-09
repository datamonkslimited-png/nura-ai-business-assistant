from __future__ import annotations

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class OrderEscalation(Base, TimestampMixin):
    """Tracks escalation attempts for unconfirmed orders."""
    __tablename__ = "order_escalations"

    id = uuid_pk()
    order_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    stage = Column(String(50), default="whatsapp_1")  # whatsapp_1 | dashboard | email | auto_timeout
    sent_at = Column(DateTime(timezone=True))
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    is_resolved = Column(Boolean, default=False)
