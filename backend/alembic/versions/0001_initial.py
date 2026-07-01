"""initial

Revision ID: 0001
Revises:
Create Date: 2026-06-08

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


tenant_plan = postgresql.ENUM(
    "free",
    "starter",
    "growth",
    "enterprise",
    name="tenantplan",
    create_type=False,
)
tenant_status = postgresql.ENUM(
    "active",
    "suspended",
    "trial",
    name="tenantstatus",
    create_type=False,
)
order_status = postgresql.ENUM(
    "pending",
    "confirmed",
    "processing",
    "ready",
    "delivered",
    "cancelled",
    name="orderstatus",
    create_type=False,
)
payment_status = postgresql.ENUM(
    "pending",
    "completed",
    "failed",
    "refunded",
    name="paymentstatus",
    create_type=False,
)
booking_status = postgresql.ENUM(
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
    name="bookingstatus",
    create_type=False,
)
conversation_status = postgresql.ENUM(
    "open",
    "bot",
    "human",
    "resolved",
    name="conversationstatus",
    create_type=False,
)
message_direction = postgresql.ENUM(
    "inbound",
    "outbound",
    name="messagedirection",
    create_type=False,
)


def _uuid_pk() -> sa.Column:
    return sa.Column(
        "id",
        postgresql.UUID(as_uuid=True),
        server_default=sa.text("gen_random_uuid()"),
        nullable=False,
    )


def _timestamps() -> tuple[sa.Column, sa.Column]:
    return (
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    bind = op.get_bind()
    tenant_plan.create(bind, checkfirst=True)
    tenant_status.create(bind, checkfirst=True)
    order_status.create(bind, checkfirst=True)
    payment_status.create(bind, checkfirst=True)
    booking_status.create(bind, checkfirst=True)
    conversation_status.create(bind, checkfirst=True)
    message_direction.create(bind, checkfirst=True)

    op.create_table(
        "tenants",
        _uuid_pk(),
        sa.Column("business_name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("industry", sa.String(100), nullable=True),
        sa.Column("country", sa.String(10), server_default="KE", nullable=True),
        sa.Column("currency", sa.String(10), server_default="KES", nullable=True),
        sa.Column(
            "plan",
            tenant_plan,
            server_default="free",
            nullable=False,
        ),
        sa.Column(
            "status",
            tenant_status,
            server_default="trial",
            nullable=False,
        ),
        sa.Column("wa_phone_number_id", sa.String(100), nullable=True),
        sa.Column("wa_access_token", sa.Text(), nullable=True),
        sa.Column("wa_connected", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("mpesa_shortcode", sa.String(20), nullable=True),
        sa.Column("mpesa_passkey", sa.Text(), nullable=True),
        sa.Column("mpesa_consumer_key", sa.Text(), nullable=True),
        sa.Column("mpesa_consumer_secret", sa.Text(), nullable=True),
        sa.Column("mpesa_live", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("ai_tone", sa.String(50), server_default="professional", nullable=True),
        sa.Column("ai_language", sa.String(20), server_default="en", nullable=True),
        sa.Column("ai_custom_instructions", sa.Text(), nullable=True),
        *_timestamps(),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_tenants_slug"),
    )
    op.create_index("ix_tenants_slug", "tenants", ["slug"], unique=False)

    op.create_table(
        "tenant_users",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supabase_user_id", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("role", sa.String(50), server_default="owner", nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("supabase_user_id", name="uq_tenant_users_supabase_user_id"),
    )
    op.create_index("ix_tenant_users_tenant_id", "tenant_users", ["tenant_id"])

    op.create_table(
        "customers",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("tags", sa.String(500), nullable=True),
        sa.Column("total_orders", sa.Integer(), server_default="0", nullable=True),
        sa.Column("total_spent", sa.Integer(), server_default="0", nullable=True),
        sa.Column("is_blocked", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("wa_opt_in", sa.Boolean(), server_default="true", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_customers_tenant_id", "customers", ["tenant_id"])
    op.create_index("idx_customers_tenant_phone", "customers", ["tenant_id", "phone"])

    op.create_table(
        "products",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("stock_quantity", sa.Integer(), server_default="0", nullable=True),
        sa.Column("sku", sa.String(100), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_products_tenant_id", "products", ["tenant_id"])
    op.create_index("idx_products_tenant_category", "products", ["tenant_id", "category"])

    op.create_table(
        "branches",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("is_main", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("opening_hours", sa.Text(), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_branches_tenant_id", "branches", ["tenant_id"])

    op.create_table(
        "staff",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("role", sa.String(50), server_default="staff", nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_staff_tenant_id", "staff", ["tenant_id"])

    op.create_table(
        "subscriptions",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan", sa.String(50), server_default="trial", nullable=True),
        sa.Column("status", sa.String(50), server_default="trialing", nullable=True),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("amount_kshs", sa.Integer(), server_default="0", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", name="uq_subscriptions_tenant_id"),
    )

    op.create_table(
        "conversations",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("customer_phone", sa.String(20), nullable=False),
        sa.Column(
            "status",
            conversation_status,
            server_default="bot",
            nullable=True,
        ),
        sa.Column("assigned_to", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("unread_count", sa.String(10), server_default="0", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_conversations_tenant_id", "conversations", ["tenant_id"])
    op.create_index(
        "idx_conversations_tenant_phone",
        "conversations",
        ["tenant_id", "customer_phone"],
    )

    op.create_table(
        "orders",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("order_number", sa.String(30), nullable=False),
        sa.Column("status", order_status, server_default="pending", nullable=True),
        sa.Column("subtotal", sa.Integer(), server_default="0", nullable=True),
        sa.Column("total", sa.Integer(), server_default="0", nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("channel", sa.String(50), server_default="whatsapp", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("order_number", name="uq_orders_order_number"),
    )
    op.create_index("ix_orders_tenant_id", "orders", ["tenant_id"])
    op.create_index("idx_orders_tenant_status", "orders", ["tenant_id", "status"])

    op.create_table(
        "order_items",
        _uuid_pk(),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("quantity", sa.Integer(), server_default="1", nullable=True),
        sa.Column("unit_price", sa.Integer(), nullable=False),
        sa.Column("total_price", sa.Integer(), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_order_items_order_id", "order_items", ["order_id"])

    op.create_table(
        "bookings",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("service_name", sa.String(255), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), server_default="60", nullable=True),
        sa.Column("price", sa.Integer(), server_default="0", nullable=True),
        sa.Column("status", booking_status, server_default="pending", nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("reminder_sent", sa.String(10), server_default="no", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_bookings_tenant_id", "bookings", ["tenant_id"])
    op.create_index("idx_bookings_tenant_scheduled", "bookings", ["tenant_id", "scheduled_at"])

    op.create_table(
        "payments",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("customer_phone", sa.String(20), nullable=True),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(10), server_default="KES", nullable=True),
        sa.Column("method", sa.String(30), server_default="mpesa", nullable=True),
        sa.Column("status", payment_status, server_default="pending", nullable=True),
        sa.Column("mpesa_checkout_id", sa.String(100), nullable=True),
        sa.Column("mpesa_receipt", sa.String(100), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payments_tenant_id", "payments", ["tenant_id"])
    op.create_index("idx_payments_order_id", "payments", ["order_id"])
    op.create_index("idx_payments_tenant_status", "payments", ["tenant_id", "status"])

    op.create_table(
        "messages",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("wa_message_id", sa.String(100), nullable=True),
        sa.Column("direction", message_direction, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("message_type", sa.String(30), server_default="text", nullable=True),
        sa.Column("ai_stage", sa.String(30), nullable=True),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_messages_tenant_id", "messages", ["tenant_id"])
    op.create_index("idx_messages_conversation_id", "messages", ["conversation_id"])

    op.create_table(
        "notifications",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("type", sa.String(50), server_default="info", nullable=True),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("link", sa.String(500), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_tenant_id", "notifications", ["tenant_id"])

    op.create_table(
        "audit_logs",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(50), nullable=True),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_tenant_id", "audit_logs", ["tenant_id"])

    op.create_table(
        "ai_usage_logs",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("model", sa.String(100), nullable=True),
        sa.Column("stage", sa.String(50), nullable=True),
        sa.Column("input_tokens", sa.Integer(), server_default="0", nullable=True),
        sa.Column("output_tokens", sa.Integer(), server_default="0", nullable=True),
        sa.Column("cost_usd_micro", sa.Integer(), server_default="0", nullable=True),
        sa.Column("latency_ms", sa.Integer(), server_default="0", nullable=True),
        sa.Column("success", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_usage_logs_tenant_id", "ai_usage_logs", ["tenant_id"])

    op.create_table(
        "scheduled_tasks",
        _uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("task_type", sa.String(100), nullable=True),
        sa.Column("cron_expression", sa.String(100), nullable=True),
        sa.Column("payload", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_run_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_scheduled_tasks_tenant_id", "scheduled_tasks", ["tenant_id"])


def downgrade() -> None:
    op.drop_index("ix_scheduled_tasks_tenant_id", table_name="scheduled_tasks")
    op.drop_table("scheduled_tasks")
    op.drop_index("ix_ai_usage_logs_tenant_id", table_name="ai_usage_logs")
    op.drop_table("ai_usage_logs")
    op.drop_index("ix_audit_logs_tenant_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_notifications_tenant_id", table_name="notifications")
    op.drop_table("notifications")
    op.drop_index("idx_messages_conversation_id", table_name="messages")
    op.drop_index("ix_messages_tenant_id", table_name="messages")
    op.drop_table("messages")
    op.drop_index("idx_payments_tenant_status", table_name="payments")
    op.drop_index("idx_payments_order_id", table_name="payments")
    op.drop_index("ix_payments_tenant_id", table_name="payments")
    op.drop_table("payments")
    op.drop_index("idx_bookings_tenant_scheduled", table_name="bookings")
    op.drop_index("ix_bookings_tenant_id", table_name="bookings")
    op.drop_table("bookings")
    op.drop_index("idx_order_items_order_id", table_name="order_items")
    op.drop_table("order_items")
    op.drop_index("idx_orders_tenant_status", table_name="orders")
    op.drop_index("ix_orders_tenant_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("idx_conversations_tenant_phone", table_name="conversations")
    op.drop_index("ix_conversations_tenant_id", table_name="conversations")
    op.drop_table("conversations")
    op.drop_table("subscriptions")
    op.drop_index("ix_staff_tenant_id", table_name="staff")
    op.drop_table("staff")
    op.drop_index("ix_branches_tenant_id", table_name="branches")
    op.drop_table("branches")
    op.drop_index("idx_products_tenant_category", table_name="products")
    op.drop_index("ix_products_tenant_id", table_name="products")
    op.drop_table("products")
    op.drop_index("idx_customers_tenant_phone", table_name="customers")
    op.drop_index("ix_customers_tenant_id", table_name="customers")
    op.drop_table("customers")
    op.drop_index("ix_tenant_users_tenant_id", table_name="tenant_users")
    op.drop_table("tenant_users")
    op.drop_index("ix_tenants_slug", table_name="tenants")
    op.drop_table("tenants")

    bind = op.get_bind()
    message_direction.drop(bind, checkfirst=True)
    conversation_status.drop(bind, checkfirst=True)
    booking_status.drop(bind, checkfirst=True)
    payment_status.drop(bind, checkfirst=True)
    order_status.drop(bind, checkfirst=True)
    tenant_status.drop(bind, checkfirst=True)
    tenant_plan.drop(bind, checkfirst=True)
