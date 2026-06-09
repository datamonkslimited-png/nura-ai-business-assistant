import enum
from sqlalchemy import Column, String, Integer, Text, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True))
    service_name = Column(String(255), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60)
    price = Column(Integer, default=0)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.pending)
    notes = Column(Text)
    reminder_sent = Column(String(10), default="no")

    tenant = relationship("Tenant", back_populates="bookings")
    customer = relationship("Customer", back_populates="bookings")
