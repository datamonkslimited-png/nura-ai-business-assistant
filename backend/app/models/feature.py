from __future__ import annotations

from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class Feature(Base, TimestampMixin):
    """A capability that can be assigned to a tenant."""
    __tablename__ = "features"

    id = uuid_pk()
    key = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # ai | dashboard | payment | communication
    is_active = Column(Boolean, default=True)


class BusinessTemplate(Base, TimestampMixin):
    """A named bundle of features for a business type."""
    __tablename__ = "business_templates"

    id = uuid_pk()
    key = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    is_active = Column(Boolean, default=True)

    feature_assignments = relationship(
        "TemplateFeature", back_populates="template", cascade="all, delete-orphan"
    )


class TemplateFeature(Base):
    """Which features belong to a template."""
    __tablename__ = "template_features"

    template_id = Column(
        UUID(as_uuid=True), ForeignKey("business_templates.id"), primary_key=True
    )
    feature_id = Column(
        UUID(as_uuid=True), ForeignKey("features.id"), primary_key=True
    )

    template = relationship("BusinessTemplate", back_populates="feature_assignments")
    feature = relationship("Feature")


class TenantFeature(Base, TimestampMixin):
    """Which features a specific tenant has enabled."""
    __tablename__ = "tenant_features"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    feature_id = Column(UUID(as_uuid=True), ForeignKey("features.id"), nullable=False)
    enabled = Column(Boolean, default=True)

    feature = relationship("Feature")
