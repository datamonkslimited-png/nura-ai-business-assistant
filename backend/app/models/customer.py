from sqlalchemy import Column, String, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255))
    notes = Column(Text)
    tags = Column(String(500))
    total_orders = Column(Integer, default=0)
    total_spent = Column(Integer, default=0)  # stored in KSh cents
    is_blocked = Column(Boolean, default=False)
    wa_opt_in = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="customers")
    orders = relationship("Order", back_populates="customer")
    bookings = relationship("Booking", back_populates="customer")
    conversations = relationship("Conversation", back_populates="customer")
