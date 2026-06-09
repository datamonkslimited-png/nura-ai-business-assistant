from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    title = Column(String(255), nullable=False)
    body = Column(Text)
    type = Column(String(50), default="info")  # info | warning | error | success
    is_read = Column(Boolean, default=False)
    link = Column(String(500))
