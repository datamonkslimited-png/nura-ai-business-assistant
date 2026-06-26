"""whatsapp inbound message idempotency

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-26
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


INDEX_NAME = "uq_messages_tenant_inbound_wa_message_id"


def upgrade() -> None:
    bind = op.get_bind()
    duplicates = bind.execute(
        sa.text(
            """
            SELECT tenant_id, wa_message_id, COUNT(*) AS duplicate_count
            FROM messages
            WHERE wa_message_id IS NOT NULL
              AND direction = 'inbound'
            GROUP BY tenant_id, wa_message_id
            HAVING COUNT(*) > 1
            LIMIT 10
            """
        )
    ).fetchall()

    if duplicates:
        details = ", ".join(
            f"tenant_id={row.tenant_id} wa_message_id={row.wa_message_id} count={row.duplicate_count}"
            for row in duplicates
        )
        raise RuntimeError(
            "Cannot create WhatsApp idempotency index because duplicate inbound "
            f"message IDs already exist: {details}"
        )

    op.create_index(
        INDEX_NAME,
        "messages",
        ["tenant_id", "wa_message_id"],
        unique=True,
        postgresql_where=sa.text("wa_message_id IS NOT NULL AND direction = 'inbound'"),
    )


def downgrade() -> None:
    op.drop_index(INDEX_NAME, table_name="messages")
