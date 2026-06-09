from sqlalchemy import Column, String, Boolean, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base, TimestampMixin, uuid_pk


class TenantPlan(str, enum.Enum):
    free = "free"
    starter = "starter"
    growth = "growth"
    enterprise = "enterprise"


class TenantStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    trial = "trial"


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id = uuid_pk()
    business_name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    industry = Column(String(100))
    country = Column(String(10), default="KE")
    currency = Column(String(10), default="KES")
    plan = Column(SAEnum(TenantPlan), default=TenantPlan.free, nullable=False)
    status = Column(SAEnum(TenantStatus), default=TenantStatus.trial, nullable=False)
    wa_phone_number_id = Column(String(100))
    wa_access_token = Column(Text)
    wa_connected = Column(Boolean, default=False)
    mpesa_shortcode = Column(String(20))
    mpesa_passkey = Column(Text)
    mpesa_consumer_key = Column(Text)
    mpesa_consumer_secret = Column(Text)
    mpesa_live = Column(Boolean, default=False)
    ai_tone = Column(String(50), default="professional")
    ai_language = Column(String(20), default="en")
    ai_custom_instructions = Column(Text)
    ai_agent_name = Column(String(100), default="Nura")
    ai_strictness = Column(String(20), default="flexible")  # strict | flexible
    business_type = Column(String(100))                      # e.g. salon, bakery
    template_key = Column(String(50))                        # which template is assigned
    business_hours = Column(Text)                            # JSON: {"mon": "08:00-18:00", ...}
    owner_phone = Column(String(20))                         # for escalation notifications

    users = relationship("TenantUser", back_populates="tenant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="tenant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="tenant", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="tenant", cascade="all, delete-orphan")
    branches = relationship("Branch", back_populates="tenant", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="tenant", uselist=False)


class TenantUser(Base, TimestampMixin):
    __tablename__ = "tenant_users"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    supabase_user_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="owner")  # owner | staff | agent
    is_active = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="users")
