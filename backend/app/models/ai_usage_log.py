from sqlalchemy import Column, String, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class AiUsageLog(Base, TimestampMixin):
    __tablename__ = "ai_usage_logs"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    conversation_id = Column(UUID(as_uuid=True), nullable=True)
    model = Column(String(100))
    stage = Column(String(50))  # deterministic | haiku | sonnet
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_usd_micro = Column(Integer, default=0)  # cost * 1_000_000 for precision
    latency_ms = Column(Integer, default=0)
    success = Column(Boolean, default=True)
    error = Column(Text)
