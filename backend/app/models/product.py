from sqlalchemy import Column, String, Text, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Integer, nullable=False)   # KSh cents
    stock_quantity = Column(Integer, default=0)
    sku = Column(String(100))
    image_url = Column(Text)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="products")
