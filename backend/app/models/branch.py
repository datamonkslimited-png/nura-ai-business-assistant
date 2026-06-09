from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class Branch(Base, TimestampMixin):
    __tablename__ = "branches"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    phone = Column(String(20))
    email = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_main = Column(Boolean, default=False)
    opening_hours = Column(Text)  # JSON string

    tenant = relationship("Tenant", back_populates="branches")
