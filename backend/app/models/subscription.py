from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
    plan = Column(String(50), default="trial")
    status = Column(String(50), default="trialing")  # trialing | active | past_due | cancelled
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    stripe_subscription_id = Column(String(255))
    stripe_customer_id = Column(String(255))
    amount_kshs = Column(Integer, default=0)

    tenant = relationship("Tenant", back_populates="subscription", uselist=False)
