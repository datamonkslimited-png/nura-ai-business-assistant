from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class Staff(Base, TimestampMixin):
    __tablename__ = "staff"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    branch_id = Column(UUID(as_uuid=True), nullable=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    role = Column(String(50), default="staff")  # owner | manager | staff | agent
    is_active = Column(Boolean, default=True)
    avatar_url = Column(Text)
