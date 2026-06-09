import enum
from sqlalchemy import Column, String, Integer, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    ready = "ready"
    delivered = "delivered"
    cancelled = "cancelled"


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), nullable=True)
    order_number = Column(String(30), unique=True, nullable=False)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending)
    subtotal = Column(Integer, default=0)    # KSh cents
    total = Column(Integer, default=0)
    notes = Column(Text)
    channel = Column(String(50), default="whatsapp")  # whatsapp | manual | web

    tenant = relationship("Tenant", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id = uuid_pk()
    order_id = Column(UUID(as_uuid=True), nullable=False)
    product_id = Column(UUID(as_uuid=True))
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
