import enum
from sqlalchemy import Column, String, Integer, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    order_id = Column(UUID(as_uuid=True))
    customer_phone = Column(String(20))
    amount = Column(Integer, nullable=False)   # KSh cents
    currency = Column(String(10), default="KES")
    method = Column(String(30), default="mpesa")
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending)
    mpesa_checkout_id = Column(String(100))
    mpesa_receipt = Column(String(100))
    failure_reason = Column(Text)

    order = relationship("Order", back_populates="payments")
