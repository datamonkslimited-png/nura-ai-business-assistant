"""sprint1: knowledge docs, conversation states, feature registry, order escalations, tenant fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- knowledge_documents ---
    op.create_table('knowledge_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('doc_type', sa.String(50), nullable=True, server_default='faq'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('sort_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_knowledge_tenant', 'knowledge_documents', ['tenant_id'])
    op.create_index('idx_knowledge_type', 'knowledge_documents', ['tenant_id', 'doc_type'])

    # --- conversation_states ---
    op.create_table('conversation_states',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('customer_phone', sa.String(20), nullable=False),
        sa.Column('flow', sa.String(50), nullable=True, server_default='idle'),
        sa.Column('step', sa.String(100), nullable=True, server_default=''),
        sa.Column('data', sa.Text(), nullable=True, server_default='{}'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'customer_phone', name='uq_state_tenant_phone')
    )
    op.create_index('idx_state_tenant_phone', 'conversation_states', ['tenant_id', 'customer_phone'])

    # --- features ---
    op.create_table('features',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(100), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key', name='uq_feature_key')
    )

    # --- business_templates ---
    op.create_table('business_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(100), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(10), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key', name='uq_template_key')
    )

    # --- template_features ---
    op.create_table('template_features',
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('feature_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['template_id'], ['business_templates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['feature_id'], ['features.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('template_id', 'feature_id')
    )

    # --- tenant_features ---
    op.create_table('tenant_features',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('feature_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['feature_id'], ['features.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_tenant_features_tenant', 'tenant_features', ['tenant_id'])

    # --- order_escalations ---
    op.create_table('order_escalations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('stage', sa.String(50), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_escalations_tenant', 'order_escalations', ['tenant_id'])
    op.create_index('idx_escalations_order', 'order_escalations', ['order_id'])

    # --- new columns on tenants ---
    op.add_column('tenants', sa.Column('ai_agent_name', sa.String(100), nullable=True, server_default='Nura'))
    op.add_column('tenants', sa.Column('ai_strictness', sa.String(20), nullable=True, server_default='flexible'))
    op.add_column('tenants', sa.Column('business_type', sa.String(100), nullable=True))
    op.add_column('tenants', sa.Column('template_key', sa.String(50), nullable=True))
    op.add_column('tenants', sa.Column('business_hours', sa.Text(), nullable=True))
    op.add_column('tenants', sa.Column('owner_phone', sa.String(20), nullable=True))


def downgrade() -> None:
    # Drop in reverse order
    op.drop_column('tenants', 'owner_phone')
    op.drop_column('tenants', 'business_hours')
    op.drop_column('tenants', 'template_key')
    op.drop_column('tenants', 'business_type')
    op.drop_column('tenants', 'ai_strictness')
    op.drop_column('tenants', 'ai_agent_name')
    op.drop_index('idx_escalations_order', table_name='order_escalations')
    op.drop_index('idx_escalations_tenant', table_name='order_escalations')
    op.drop_table('order_escalations')
    op.drop_index('idx_tenant_features_tenant', table_name='tenant_features')
    op.drop_table('tenant_features')
    op.drop_table('template_features')
    op.drop_table('business_templates')
    op.drop_table('features')
    op.drop_index('idx_state_tenant_phone', table_name='conversation_states')
    op.drop_table('conversation_states')
    op.drop_index('idx_knowledge_type', table_name='knowledge_documents')
    op.drop_index('idx_knowledge_tenant', table_name='knowledge_documents')
    op.drop_table('knowledge_documents')
