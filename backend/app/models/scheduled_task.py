from sqlalchemy import Column, String, Boolean, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, uuid_pk


class ScheduledTask(Base, TimestampMixin):
    __tablename__ = "scheduled_tasks"

    id = uuid_pk()
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255))
    task_type = Column(String(100))  # booking_reminder | followup | campaign
    cron_expression = Column(String(100))
    payload = Column(Text)  # JSON
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
