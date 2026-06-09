from __future__ import annotations

import json
from sqlalchemy import Column, String, Text, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class ConversationState(Base, TimestampMixin):
    """
    Tracks multi-turn conversation state per customer phone + tenant.
    Used by the state machine to know where in a flow we are.
    """
    __tablename__ = "conversation_states"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customer_phone = Column(String(20), nullable=False)
    flow = Column(String(50), default="idle")  # idle | order | booking | quote
    step = Column(String(100), default="")     # e.g. "awaiting_quantity", "awaiting_address"
    data = Column(Text, default="{}")           # JSON blob: cart items, booking details, etc.
    expires_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("tenant_id", "customer_phone", name="uq_state_tenant_phone"),
        {},
    )

    def get_data(self) -> dict:
        try:
            return json.loads(self.data or "{}")
        except Exception:
            return {}

    def set_data(self, d: dict) -> None:
        self.data = json.dumps(d)
