-- ============================================================
-- NURA AI Business Assistant — PostgreSQL Schema
-- Multi-tenant, RLS-ready, UUID primary keys
-- Run with: psql -U nura -d nura_db -f schema.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For fuzzy search on names
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- For accent-insensitive search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE tenant_status     AS ENUM ('trial', 'active', 'suspended', 'cancelled');
CREATE TYPE user_role          AS ENUM ('super_admin', 'tenant_owner', 'tenant_admin', 'staff', 'support_agent');
CREATE TYPE subscription_plan  AS ENUM ('starter', 'growth', 'business', 'enterprise');
CREATE TYPE order_status       AS ENUM ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status     AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE booking_status     AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE message_direction  AS ENUM ('inbound', 'outbound');
CREATE TYPE message_channel    AS ENUM ('whatsapp', 'instagram', 'messenger', 'sms');
CREATE TYPE ai_model           AS ENUM ('deterministic', 'claude_haiku', 'claude_sonnet');

-- ============================================================
-- TENANTS (the businesses using NURA)
-- ============================================================

CREATE TABLE tenants (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL,
    slug              TEXT UNIQUE NOT NULL,  -- e.g. mama-graces-bakery
    business_type     TEXT,                  -- bakery, salon, clinic, etc.
    phone             TEXT,
    email             TEXT,
    address           TEXT,
    city              TEXT DEFAULT 'Nairobi',
    country           TEXT DEFAULT 'KE',
    timezone          TEXT DEFAULT 'Africa/Nairobi',
    currency          TEXT DEFAULT 'KES',
    logo_url          TEXT,
    website_url       TEXT,
    description       TEXT,
    status            tenant_status DEFAULT 'trial',
    trial_ends_at     TIMESTAMPTZ,

    -- WhatsApp config
    wa_phone_number_id   TEXT,
    wa_access_token      TEXT,
    wa_webhook_secret    TEXT,
    wa_phone_number      TEXT,

    -- M-Pesa config
    mpesa_consumer_key    TEXT,
    mpesa_consumer_secret TEXT,
    mpesa_shortcode       TEXT,
    mpesa_passkey         TEXT,
    mpesa_live_mode       BOOLEAN DEFAULT FALSE,

    -- AI config
    ai_agent_name      TEXT DEFAULT 'Nura',
    ai_tone            TEXT DEFAULT 'friendly',
    ai_language        TEXT DEFAULT 'auto',   -- auto | en | sw
    ai_custom_prompt   TEXT,

    -- Meta
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug   ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan           subscription_plan NOT NULL DEFAULT 'starter',
    price_ksh      INTEGER NOT NULL,          -- Monthly price in KSh
    ai_conv_limit  INTEGER DEFAULT 500,       -- Conversations per month
    product_limit  INTEGER DEFAULT 50,
    wa_numbers     INTEGER DEFAULT 1,
    starts_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at        TIMESTAMPTZ,
    cancelled_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);

-- ============================================================
-- USERS (auth mapped to Supabase auth.users)
-- ============================================================

CREATE TABLE users (
    id          UUID PRIMARY KEY,            -- Matches Supabase auth.users.id
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    phone       TEXT,
    full_name   TEXT,
    avatar_url  TEXT,
    role        user_role NOT NULL DEFAULT 'staff',
    is_active   BOOLEAN DEFAULT TRUE,
    last_seen   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant   ON users(tenant_id);
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);

-- ============================================================
-- CUSTOMERS (end customers who message businesses)
-- ============================================================

CREATE TABLE customers (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone          TEXT NOT NULL,
    name           TEXT,
    email          TEXT,
    wa_id          TEXT,                       -- WhatsApp internal ID
    avatar_url     TEXT,
    notes          TEXT,
    tags           TEXT[],
    total_orders   INTEGER DEFAULT 0,
    total_spent    NUMERIC(12,2) DEFAULT 0,
    last_seen      TIMESTAMPTZ,
    opted_in       BOOLEAN DEFAULT TRUE,       -- WhatsApp opt-in
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, phone)
);

CREATE INDEX idx_customers_tenant   ON customers(tenant_id);
CREATE INDEX idx_customers_phone    ON customers(phone);
CREATE INDEX idx_customers_name_gin ON customers USING gin(name gin_trgm_ops);

-- ============================================================
-- PRODUCTS / SERVICES
-- ============================================================

CREATE TABLE products (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT,
    price        NUMERIC(10,2) NOT NULL,
    category     TEXT,
    sku          TEXT,
    image_url    TEXT,
    in_stock     BOOLEAN DEFAULT TRUE,
    stock_count  INTEGER,
    is_service   BOOLEAN DEFAULT FALSE,     -- FALSE = product, TRUE = service/booking
    duration_min INTEGER,                   -- For services: duration in minutes
    is_active    BOOLEAN DEFAULT TRUE,
    sort_order   INTEGER DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_tenant   ON products(tenant_id);
CREATE INDEX idx_products_category ON products(tenant_id, category);
CREATE INDEX idx_products_name_gin ON products USING gin(name gin_trgm_ops);

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES customers(id),
    channel         message_channel DEFAULT 'whatsapp',
    status          TEXT DEFAULT 'open',      -- open | closed | snoozed
    assigned_to     UUID REFERENCES users(id),
    last_message_at TIMESTAMPTZ,
    message_count   INTEGER DEFAULT 0,
    ai_handled      BOOLEAN DEFAULT TRUE,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_tenant   ON conversations(tenant_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_status   ON conversations(tenant_id, status);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id  UUID NOT NULL REFERENCES conversations(id),
    customer_id      UUID REFERENCES customers(id),
    direction        message_direction NOT NULL,
    channel          message_channel DEFAULT 'whatsapp',
    wa_message_id    TEXT,                        -- Meta message ID
    content          TEXT,
    content_type     TEXT DEFAULT 'text',          -- text | image | audio | button | template
    media_url        TEXT,
    intent           TEXT,                         -- Classified intent
    ai_model_used    ai_model,
    ai_tokens_in     INTEGER DEFAULT 0,
    ai_tokens_out    INTEGER DEFAULT 0,
    ai_latency_ms    INTEGER,
    sent_at          TIMESTAMPTZ DEFAULT NOW(),
    delivered_at     TIMESTAMPTZ,
    read_at          TIMESTAMPTZ,
    failed_at        TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_tenant          ON messages(tenant_id);
CREATE INDEX idx_messages_conversation    ON messages(conversation_id);
CREATE INDEX idx_messages_customer        ON messages(customer_id);
CREATE INDEX idx_messages_direction       ON messages(direction);
CREATE INDEX idx_messages_sent_at         ON messages(sent_at DESC);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id    UUID NOT NULL REFERENCES customers(id),
    conversation_id UUID REFERENCES conversations(id),
    order_number   TEXT UNIQUE NOT NULL,            -- e.g. ORD-2026-001
    status         order_status DEFAULT 'pending',
    subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount       NUMERIC(12,2) DEFAULT 0,
    delivery_fee   NUMERIC(12,2) DEFAULT 0,
    total          NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency       TEXT DEFAULT 'KES',
    delivery_address TEXT,
    delivery_notes TEXT,
    delivery_at    TIMESTAMPTZ,
    notes          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant     ON orders(tenant_id);
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_status     ON orders(tenant_id, status);
CREATE INDEX idx_orders_number     ON orders(order_number);

-- Order line items
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID REFERENCES products(id),
    name        TEXT NOT NULL,                    -- Snapshot of product name
    quantity    INTEGER NOT NULL DEFAULT 1,
    unit_price  NUMERIC(10,2) NOT NULL,
    total       NUMERIC(10,2) NOT NULL,
    notes       TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE bookings (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id    UUID NOT NULL REFERENCES customers(id),
    product_id     UUID REFERENCES products(id),   -- The service being booked
    conversation_id UUID REFERENCES conversations(id),
    staff_id       UUID REFERENCES users(id),
    service_name   TEXT NOT NULL,
    status         booking_status DEFAULT 'pending',
    scheduled_at   TIMESTAMPTZ NOT NULL,
    duration_min   INTEGER DEFAULT 60,
    price          NUMERIC(10,2),
    notes          TEXT,
    reminder_sent  BOOLEAN DEFAULT FALSE,
    cancelled_at   TIMESTAMPTZ,
    cancel_reason  TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_tenant       ON bookings(tenant_id);
CREATE INDEX idx_bookings_customer     ON bookings(customer_id);
CREATE INDEX idx_bookings_staff        ON bookings(staff_id);
CREATE INDEX idx_bookings_scheduled    ON bookings(tenant_id, scheduled_at);
CREATE INDEX idx_bookings_status       ON bookings(tenant_id, status);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id              UUID REFERENCES orders(id),
    customer_id           UUID NOT NULL REFERENCES customers(id),
    amount                NUMERIC(12,2) NOT NULL,
    currency              TEXT DEFAULT 'KES',
    status                payment_status DEFAULT 'pending',
    method                TEXT DEFAULT 'mpesa',
    -- M-Pesa specific
    mpesa_checkout_req_id TEXT,
    mpesa_receipt         TEXT UNIQUE,
    mpesa_phone           TEXT,
    mpesa_result_code     INTEGER,
    mpesa_result_desc     TEXT,
    mpesa_transaction_date TIMESTAMPTZ,
    -- Timestamps
    initiated_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at          TIMESTAMPTZ,
    failed_at             TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant          ON payments(tenant_id);
CREATE INDEX idx_payments_order           ON payments(order_id);
CREATE INDEX idx_payments_customer        ON payments(customer_id);
CREATE INDEX idx_payments_status          ON payments(tenant_id, status);
CREATE INDEX idx_payments_mpesa_checkout  ON payments(mpesa_checkout_req_id);
CREATE INDEX idx_payments_mpesa_receipt   ON payments(mpesa_receipt);

-- ============================================================
-- AI USAGE TRACKING (for billing + rate limiting)
-- ============================================================

CREATE TABLE ai_usage (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    model         ai_model NOT NULL,
    tokens_in     INTEGER NOT NULL DEFAULT 0,
    tokens_out    INTEGER NOT NULL DEFAULT 0,
    latency_ms    INTEGER,
    cost_usd      NUMERIC(8,6),               -- Calculated cost in USD
    intent        TEXT,
    message_id    UUID REFERENCES messages(id),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_tenant    ON ai_usage(tenant_id);
CREATE INDEX idx_ai_usage_date      ON ai_usage(tenant_id, created_at DESC);
CREATE INDEX idx_ai_usage_model     ON ai_usage(model);

-- ============================================================
-- KNOWLEDGE BASE (AI training data per tenant)
-- ============================================================

CREATE TABLE knowledge_documents (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    content      TEXT NOT NULL,
    doc_type     TEXT DEFAULT 'faq',       -- faq | policy | product | delivery | general
    embedding    vector(1536),             -- pgvector for RAG (optional)
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_tenant ON knowledge_documents(tenant_id);
CREATE INDEX idx_knowledge_type   ON knowledge_documents(tenant_id, doc_type);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    body        TEXT,
    type        TEXT DEFAULT 'info',       -- info | warning | success | error
    link        TEXT,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID REFERENCES tenants(id),
    user_id     UUID REFERENCES users(id),
    action      TEXT NOT NULL,             -- e.g. order.created, payment.received
    entity_type TEXT,                      -- order | customer | booking | etc.
    entity_id   UUID,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant     ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user       ON audit_logs(user_id);

-- ============================================================
-- REFERRAL AGENTS (sales agents who onboard tenants)
-- ============================================================

CREATE TABLE referral_agents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    phone           TEXT,
    referral_code   TEXT UNIQUE NOT NULL,
    commission_pct  NUMERIC(5,2) DEFAULT 20.00,  -- % of subscription revenue
    total_tenants   INTEGER DEFAULT 0,
    total_earnings  NUMERIC(12,2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id    UUID NOT NULL REFERENCES referral_agents(id),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    commission  NUMERIC(10,2),
    paid_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable per-tenant data isolation at DB level
-- ============================================================

ALTER TABLE tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage            ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own tenant's data
-- (app sets app.current_tenant_id via SET LOCAL)

CREATE POLICY tenant_isolation ON customers
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON products
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON bookings
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON messages
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON payments
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================
-- AUTOMATED UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated   BEFORE UPDATE ON tenants   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated  BEFORE UPDATE ON products  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated  BEFORE UPDATE ON bookings  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ORDER NUMBER SEQUENCE
-- ============================================================

CREATE SEQUENCE order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();
