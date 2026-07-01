# NURA Canonical Schema Decisions

Status: design decision for Phase 0C. This document does not authorize migration,
model, application, or database changes.

## 1. Scope and decision principles

This schema covers only modules already represented in the backend. Future leads,
quotes, shipments, listings, packages, fulfilment, delivery/service areas, and
advanced automation remain out of scope.

The canonical schema follows these rules:

- Alembic will ultimately be the only schema deployment authority.
- PostgreSQL names use lowercase `snake_case`.
- Primary keys are application-generated UUIDs.
- Tenant-owned records carry a non-null `tenant_id`, even when ownership could be
  inferred through a parent row.
- Foreign keys use `ON DELETE RESTRICT` by default. Pure junction/history rows may
  use `CASCADE`; optional assignments use `SET NULL` where stated.
- Tenant-owned relationships must be same-tenant relationships. Migrations should
  enforce this with composite foreign keys such as `(tenant_id, customer_id)` to
  `(tenant_id, id)`, backed by the required parent unique constraint.
- Timestamps are `TIMESTAMPTZ`, stored in UTC and rendered in the tenant timezone.
- Mutable business tables have non-null `created_at` and `updated_at`, both with
  database defaults. Event/log tables generally have only `created_at`.
- Structured data uses `JSONB`, not JSON encoded into `TEXT`.
- Secrets must be encrypted at rest or represented by a secret-manager reference.
  They must never appear in API response schemas or logs.
- RLS is a later, separately tested enforcement layer. Foreign keys, composite
  tenant constraints, and application filters are required even when RLS is added.
- Existing API response field names remain compatible. Where a canonical database
  name changes, the API must retain the old name as a transitional schema alias.

## 2. Recommended canonical table list

Keep these 24 tables:

1. `tenants`
2. `tenant_users`
3. `branches`
4. `staff`
5. `subscriptions`
6. `customers`
7. `products`
8. `conversations`
9. `messages`
10. `orders`
11. `order_items`
12. `bookings`
13. `payments`
14. `knowledge_documents`
15. `conversation_states`
16. `features`
17. `business_templates`
18. `template_features`
19. `tenant_features`
20. `order_escalations`
21. `ai_usage_logs`
22. `audit_logs`
23. `notifications`
24. `scheduled_tasks`

Merge and retire after verified data migration:

- Merge legacy `users` into `tenant_users`, then retire `users`.
- Merge legacy `ai_usage` into `ai_usage_logs`, then retire `ai_usage`.

No table is to be dropped during the first adoption migration. Retirement happens
only after copy, reconciliation, application cutover, and a later cleanup release.

## 3. Shared data types and enum policy

Enums use explicitly named PostgreSQL types. SQLAlchemy must specify the name and
must not create implicit names such as `orderstatus`.

| Type | Canonical values |
|---|---|
| `tenant_status` | `trial`, `active`, `suspended`, `cancelled` |
| `subscription_plan` | `free`, `starter`, `growth`, `enterprise` |
| `subscription_status` | `trialing`, `active`, `past_due`, `cancelled` |
| `order_status` | `pending`, `confirmed`, `processing`, `ready`, `delivered`, `cancelled`, `refunded` |
| `payment_status` | `pending`, `completed`, `failed`, `cancelled`, `refunded` |
| `booking_status` | `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |
| `conversation_status` | `open`, `bot`, `human`, `resolved` |
| `message_direction` | `inbound`, `outbound` |
| `message_type` | `text`, `image`, `audio`, `button`, `interactive`, `template`, `document`, `unknown` |
| `message_status` | `received`, `queued`, `sent`, `delivered`, `read`, `failed` |
| `user_role` | `owner`, `admin`, `manager`, `staff`, `agent` |

`conversation_status` temporarily retains both `open` and `bot` for compatibility.
A later domain redesign may separate lifecycle from handling mode, but Phase 0 must
not perform that redesign.

Duplicate implicit enum types (`tenantplan`, `tenantstatus`, `orderstatus`,
`paymentstatus`, `bookingstatus`, `conversationstatus`, and `messagedirection`) are
legacy objects. Adoption migrations should move columns to the explicit canonical
types using guarded value mappings. They must not drop an enum until no column or
default references it.

## 4. Money decision

Canonical business money is integer minor units (`BIGINT`), with a three-character
ISO-4217 `currency` column. For KES, KSh 1.00 is stored as `100`.

Reasons:

- Current services already perform integer arithmetic.
- It avoids binary/decimal ambiguity in application calculations.
- It works consistently for orders, payments, products, bookings, subscriptions,
  analytics, and future deposits.
- `BIGINT` provides safer growth headroom than `INTEGER`.

Canonical money names use an `_minor` suffix internally: `price_minor`,
`subtotal_minor`, `total_minor`, `amount_minor`, and `cost_minor`. Existing API
fields such as `price`, `subtotal`, `total`, `amount`, and `amount_kshs` remain as
compatibility aliases until the API is versioned.

Legacy numeric conversion must not assume whether stored numbers mean shillings or
cents. Before migration, sample values must be reconciled against known product,
order, payment, and UI values. The adoption path should:

1. Add nullable `_minor` columns.
2. Populate them using an environment-approved conversion rule.
3. Compare totals and representative records.
4. Dual-read or dual-write during cutover if live writes continue.
5. Make `_minor` fields non-null only after verification.
6. Retain old numeric columns through at least one rollback window.

## 5. Identity decision: `tenant_users`, `users`, and `staff`

`tenant_users` is canonical for authenticated NURA membership. Legacy `users` is
merged into it. `staff` remains a separate business-domain record because a staff
member may be bookable or operational without having a NURA login.

Canonical `tenant_users` is a membership table. The same Supabase identity may
eventually belong to multiple tenants, so uniqueness is `(tenant_id,
supabase_user_id)`, not global `supabase_user_id` uniqueness. Current authentication
assumes one active tenant from JWT metadata; application support for switching
memberships is deferred and must precede removing the global uniqueness constraint.

`staff.tenant_user_id` is optional and links a staff profile to a login when one
exists. Booking assignments reference `staff`, not authenticated-user rows.

## 6. Canonical table specifications

Notation: `!` means required; `?` means nullable.

### 6.1 `tenants` — keep, reconcile legacy columns

Tenant is the account and security boundary. Business-profile extraction is a
future phase; existing profile fields stay here for now.

| Column | Type | Rule |
|---|---|---|
| `id` | UUID | PK, `!` |
| `business_name` | VARCHAR(255) | `!`; canonical replacement for legacy `name` |
| `slug` | VARCHAR(100) | `!`, unique, normalized lowercase |
| `business_type` | VARCHAR(100) | `?`; free-form/current UI classification |
| `template_key` | VARCHAR(100) | `?`, FK to `business_templates.key` |
| `phone` | VARCHAR(20) | `?` |
| `email` | VARCHAR(255) | `?` |
| `address` | TEXT | `?`; preserve from SQL |
| `city` | VARCHAR(100) | `?`; preserve from SQL |
| `country` | CHAR(2) | `!`, default `KE` |
| `timezone` | VARCHAR(64) | `!`, default `Africa/Nairobi` |
| `currency` | CHAR(3) | `!`, default `KES` |
| `logo_url` | TEXT | `?`; preserve from SQL |
| `website_url` | TEXT | `?`; preserve from SQL |
| `description` | TEXT | `?`; preserve from SQL |
| `status` | `tenant_status` | `!`, default `trial` |
| `trial_ends_at` | TIMESTAMPTZ | `?`; preserve from SQL |
| `wa_phone_number_id` | VARCHAR(100) | `?`, unique when non-null |
| `wa_phone_number` | VARCHAR(20) | `?`; preserve from SQL |
| `wa_access_token_encrypted` | TEXT | `?`; replaces plaintext token storage |
| `wa_webhook_secret_encrypted` | TEXT | `?`; preserve if tenant-specific |
| `wa_connected` | BOOLEAN | `!`, default false |
| `mpesa_shortcode` | VARCHAR(20) | `?`; sufficient for manual Till/Paybill flow |
| `mpesa_account_type` | VARCHAR(20) | `?`; constrained to `till` or `paybill` |
| `mpesa_account_name` | VARCHAR(255) | `?` |
| `mpesa_live` | BOOLEAN | `!`, default false; capability state, not payment proof |
| `mpesa_consumer_key_encrypted` | TEXT | `?`; future STK only |
| `mpesa_consumer_secret_encrypted` | TEXT | `?`; future STK only |
| `mpesa_passkey_encrypted` | TEXT | `?`; future STK only |
| `ai_agent_name` | VARCHAR(100) | `!`, default `Nura` |
| `ai_tone` | VARCHAR(50) | `!`, default `professional` |
| `ai_language` | VARCHAR(20) | `!`, default `en` |
| `ai_custom_instructions` | TEXT | `?` |
| `ai_strictness` | VARCHAR(20) | `!`, `strict` or `flexible` |
| `business_hours` | JSONB | `?` |
| `owner_phone` | VARCHAR(20) | `?` |
| `created_at`, `updated_at` | TIMESTAMPTZ | `!` |

Decision on `industry`: remove as a database duplicate after copying non-null values
into `business_type`. Keep `industry` as a deprecated API alias during transition.
Decision on `plan`: subscription is authoritative; remove `tenants.plan` after APIs
derive the displayed plan from `subscriptions`.

Indexes: unique `slug`; partial unique `wa_phone_number_id`; `(status,
created_at)`; `template_key`. Tenant itself has no `tenant_id`.

### 6.2 `tenant_users` — keep and merge legacy `users`

Columns: `id UUID !` PK; `tenant_id UUID !` FK tenants cascade;
`supabase_user_id UUID !`; `email VARCHAR(255) !`; `full_name VARCHAR(255) ?`;
`phone VARCHAR(20) ?`; `avatar_url TEXT ?`; `role user_role !` default `owner`;
`is_active BOOLEAN !` default true; `last_seen_at TIMESTAMPTZ ?`; `created_at` and
`updated_at TIMESTAMPTZ !`.

Constraints/indexes: unique `(tenant_id, supabase_user_id)`; index
`supabase_user_id`; index `(tenant_id, role, is_active)`; optional normalized-email
index. Ownership is direct and mandatory.

Legacy `users.id` values map to `supabase_user_id`; legacy tenant membership and
profile fields are copied. Conflicts require a report, not last-write-wins behavior.

### 6.3 `branches` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `name VARCHAR(255) !`; `address TEXT ?`;
`city VARCHAR(100) ?`; `phone VARCHAR(20) ?`; `email VARCHAR(255) ?`;
`is_active BOOLEAN !`; `is_main BOOLEAN !`; `opening_hours JSONB ?`;
timestamps `!`.

FK: tenant cascade. Unique `(tenant_id, name)`. Index `(tenant_id, is_active)`.
Enforce at most one main branch per tenant with a partial unique index on
`tenant_id WHERE is_main`.

### 6.4 `staff` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `branch_id UUID ?`;
`tenant_user_id UUID ?`; `full_name VARCHAR(255) !`; `phone VARCHAR(20) ?`;
`email VARCHAR(255) ?`; `role VARCHAR(50) !`; `is_active BOOLEAN !`;
`avatar_url TEXT ?`; timestamps `!`.

FKs: tenant cascade; same-tenant branch set null; same-tenant tenant-user set null.
Indexes: `(tenant_id, branch_id, is_active)`, `(tenant_id, full_name)`. Optional
unique `(tenant_id, tenant_user_id)` when linked.

### 6.5 `subscriptions` — keep, reconcile both versions

Columns: `id UUID !`; `tenant_id UUID !`; `plan subscription_plan !`;
`status subscription_status !`; `amount_minor BIGINT !` default 0;
`currency CHAR(3) !`; `current_period_start TIMESTAMPTZ ?`;
`current_period_end TIMESTAMPTZ ?`; `trial_ends_at TIMESTAMPTZ ?`;
`provider VARCHAR(30) ?`; `provider_customer_id VARCHAR(255) ?`;
`provider_subscription_id VARCHAR(255) ?`; `ai_conversation_limit INTEGER ?`;
`product_limit INTEGER ?`; `whatsapp_number_limit INTEGER ?`; timestamps `!`.

FK tenant cascade. One current subscription per tenant: unique `tenant_id` for the
present model. Provider IDs are partial unique. Index `(status,
current_period_end)`. `amount_kshs` remains an API alias for `amount_minor / 100`.

### 6.6 `customers` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `name VARCHAR(255) !`;
`phone VARCHAR(20) !`; `email VARCHAR(255) ?`; `wa_id VARCHAR(100) ?`;
`avatar_url TEXT ?`; `notes TEXT ?`; `tags TEXT[] !` default empty;
`total_orders INTEGER !` default 0; `total_spent_minor BIGINT !` default 0;
`last_seen_at TIMESTAMPTZ ?`; `is_blocked BOOLEAN !`; `wa_opt_in BOOLEAN !`;
timestamps `!`.

FK tenant cascade. Unique `(tenant_id, phone)`. Partial unique `(tenant_id, wa_id)`.
Indexes `(tenant_id, created_at)`, `(tenant_id, name)`, and optional trigram search.
Current API `total_spent` aliases `total_spent_minor`; current string tags need a
temporary serializer while converting to an array.

### 6.7 `products` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `name VARCHAR(255) !`;
`description TEXT ?`; `price_minor BIGINT !`; `currency CHAR(3) !`;
`stock_quantity INTEGER !` default 0; `sku VARCHAR(100) ?`; `image_url TEXT ?`;
`category VARCHAR(100) ?`; `is_active BOOLEAN !`; `sort_order INTEGER !`;
timestamps `!`.

FK tenant cascade. Unique `(tenant_id, sku)` when SKU is non-null. Indexes
`(tenant_id, is_active, category)`, `(tenant_id, name)`, and optional name trigram.
Do not preserve `is_service` or `duration_min` in this table: they mix future
services into products. Existing data in those fields must be inventoried before
retirement, but no services table is introduced in Phase 0.

Current API names `price` and `stock_quantity` remain compatible; `price` maps to
`price_minor` without changing the current JSON shape during repair.

### 6.8 `conversations` — keep, combine useful fields

Columns: `id UUID !`; `tenant_id UUID !`; `customer_id UUID ?`;
`customer_phone VARCHAR(20) !`; `channel VARCHAR(30) !` default `whatsapp`;
`status conversation_status !` default `bot`; `assigned_staff_id UUID ?`;
`unread_count INTEGER !` default 0; `message_count INTEGER !` default 0;
`ai_handled BOOLEAN !` default true; `last_message_at TIMESTAMPTZ ?`;
`resolved_at TIMESTAMPTZ ?`; timestamps `!`.

FKs: tenant cascade; same-tenant customer set null; same-tenant staff set null.
Indexes `(tenant_id, status, updated_at DESC)`, `(tenant_id, customer_phone,
updated_at DESC)`, `(tenant_id, assigned_staff_id, status)`. At most one active
conversation per tenant/customer/channel should be enforced only after existing
duplicates are assessed.

`assigned_to` remains a deprecated API alias for `assigned_staff_id`.

### 6.9 `messages` — keep, combine operational delivery fields

Columns: `id UUID !`; `tenant_id UUID !`; `conversation_id UUID !`;
`customer_id UUID ?`; `wa_message_id VARCHAR(255) ?`;
`direction message_direction !`; `message_type message_type !` default `text`;
`status message_status !`; `content TEXT ?`; `media_url TEXT ?`; `intent VARCHAR(100) ?`;
`ai_stage VARCHAR(30) ?`; `ai_model VARCHAR(100) ?`; `ai_input_tokens INTEGER ?`;
`ai_output_tokens INTEGER ?`; `ai_latency_ms INTEGER ?`; `is_read BOOLEAN !`;
`sent_at`, `delivered_at`, `read_at`, `failed_at TIMESTAMPTZ ?`;
`created_at`, `updated_at TIMESTAMPTZ !`.

FKs: same-tenant conversation cascade; same-tenant customer set null. Indexes
`(conversation_id, created_at)`, `(tenant_id, created_at)`, `(tenant_id, status)`.
Keep the partial unique index `(tenant_id, wa_message_id)` for non-null inbound IDs.

Current `message_type`, `ai_stage`, `is_read`, `content`, and `created_at` names are
preserved because schemas and webhook/AI code depend on them.

### 6.10 `orders` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `customer_id UUID ?`;
`conversation_id UUID ?`; `order_number VARCHAR(40) !`; `status order_status !`;
`subtotal_minor BIGINT !`; `discount_minor BIGINT !`; `delivery_fee_minor BIGINT !`;
`total_minor BIGINT !`; `currency CHAR(3) !`; `notes TEXT ?`;
`delivery_address TEXT ?`; `delivery_notes TEXT ?`; `delivery_at TIMESTAMPTZ ?`;
`channel VARCHAR(50) !`; timestamps `!`.

FKs: tenant cascade; same-tenant customer and conversation set null. Unique
`(tenant_id, order_number)`, not global order-number uniqueness. Indexes
`(tenant_id, status, created_at DESC)`, `(tenant_id, customer_id, created_at DESC)`.
Current API `subtotal` and `total` alias minor-unit fields.

### 6.11 `order_items` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `order_id UUID !`; `product_id UUID ?`;
`product_name VARCHAR(255) !`; `quantity INTEGER !`; `unit_price_minor BIGINT !`;
`total_price_minor BIGINT !`; `notes TEXT ?`; timestamps `!`.

Checks: quantity > 0; money fields >= 0; total equals quantity multiplied by unit
price unless an explicit adjustment mechanism is later introduced. Same-tenant
order FK cascades; product FK sets null. Index `(tenant_id, order_id)`.
Current `product_name`, `unit_price`, and `total_price` JSON names stay compatible.

### 6.12 `bookings` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `customer_id UUID ?`;
`conversation_id UUID ?`; `staff_id UUID ?`; `service_name VARCHAR(255) !`;
`scheduled_at TIMESTAMPTZ !`; `duration_minutes INTEGER !`;
`price_minor BIGINT !` default 0; `currency CHAR(3) !`; `status booking_status !`;
`notes TEXT ?`; `reminder_stage VARCHAR(10) !` default `none`;
`cancelled_at TIMESTAMPTZ ?`; `cancel_reason TEXT ?`; timestamps `!`.

FKs are same-tenant; customer/conversation/staff use set null. Indexes
`(tenant_id, scheduled_at)`, `(tenant_id, status, scheduled_at)`, and
`(tenant_id, staff_id, scheduled_at)`. Checks require positive duration.

The canonical database name is `reminder_stage` because current behavior stores
`none`, `24h`, and `2h`, not a boolean. Current API/model field `reminder_sent`
remains a transitional alias. Keep `duration_minutes` because schemas and workers
depend on it.

### 6.13 `payments` — keep, manual-first

Columns: `id UUID !`; `tenant_id UUID !`; `order_id UUID ?`;
`customer_id UUID ?`; `customer_phone VARCHAR(20) ?`; `amount_minor BIGINT !`;
`currency CHAR(3) !`; `method VARCHAR(30) !` default `mpesa_manual`;
`status payment_status !`; `mpesa_receipt VARCHAR(100) ?`;
`mpesa_checkout_id VARCHAR(100) ?`; `mpesa_phone VARCHAR(20) ?`;
`provider_result_code VARCHAR(30) ?`; `provider_result_description TEXT ?`;
`provider_transaction_at TIMESTAMPTZ ?`; `failure_reason TEXT ?`;
`verified_by UUID ?`; `verified_at TIMESTAMPTZ ?`; `completed_at TIMESTAMPTZ ?`;
`failed_at TIMESTAMPTZ ?`; timestamps `!`.

FKs: tenant cascade; same-tenant order/customer set null; verifier references
same-tenant `tenant_users`. Unique `(tenant_id, mpesa_receipt)` when non-null;
partial unique `mpesa_checkout_id`; indexes `(tenant_id, status, created_at)` and
`(tenant_id, order_id)`.

The platform does not custody tenant money. Manual verification can transition a
payment from `pending` to `completed`; it must record verifier and time. Existing
STK fields are retained as nullable future capability fields, not required pilot
fields. Current API names `amount`, `mpesa_checkout_id`, and `customer_phone` remain.

### 6.14 `knowledge_documents` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `title VARCHAR(255) !`; `content TEXT !`;
`doc_type VARCHAR(50) !`; `is_active BOOLEAN !`; `sort_order INTEGER !`;
timestamps `!`.

FK tenant cascade. Indexes `(tenant_id, doc_type, is_active, sort_order)` and
`(tenant_id, updated_at)`. No embedding column is included until a supported vector
store and retrieval design are selected.

### 6.15 `conversation_states` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `customer_phone VARCHAR(20) !`;
`flow VARCHAR(50) !`; `step VARCHAR(100) !`; `data JSONB !` default `{}`;
`expires_at TIMESTAMPTZ ?`; timestamps `!`.

FK tenant cascade. Unique `(tenant_id, customer_phone)`. Index `expires_at` for
cleanup. Current `data` helper behavior must be adapted from text JSON to native
JSONB without changing the service-facing dictionary contract.

### 6.16 `features` — keep as global registry

Columns: `id UUID !`; `key VARCHAR(100) !`; `name VARCHAR(255) !`;
`description TEXT ?`; `category VARCHAR(50) !`; `is_active BOOLEAN !`; timestamps.
Unique `key`; index `(category, is_active)`. No `tenant_id` because this is global
platform reference data.

### 6.17 `business_templates` — keep as global registry

Columns: `id UUID !`; `key VARCHAR(100) !`; `name VARCHAR(255) !`;
`description TEXT ?`; `icon VARCHAR(50) ?`; `is_active BOOLEAN !`; timestamps.
Unique `key`; index `is_active`. No `tenant_id`.

### 6.18 `template_features` — keep global junction

Columns: `template_id UUID !`; `feature_id UUID !`; composite PK. Both FKs cascade.
Index `feature_id`. No timestamps and no `tenant_id`; assignments are global
reference data.

### 6.19 `tenant_features` — keep tenant override junction

Columns: `id UUID !`; `tenant_id UUID !`; `feature_id UUID !`;
`enabled BOOLEAN !`; timestamps `!`.

FK tenant cascade and feature restrict. Unique `(tenant_id, feature_id)`. Index
`(tenant_id, enabled)`. This table represents the effective tenant override; template
assignment must not create duplicate rows.

### 6.20 `order_escalations` — keep as event/attempt record

Columns: `id UUID !`; `tenant_id UUID !`; `order_id UUID !`;
`stage VARCHAR(50) !`; `status VARCHAR(30) !` default `pending`;
`sent_at TIMESTAMPTZ ?`; `acknowledged_at TIMESTAMPTZ ?`;
`resolved_at TIMESTAMPTZ ?`; `error TEXT ?`; `created_at TIMESTAMPTZ !`.

Same-tenant order FK cascades. Unique `(tenant_id, order_id, stage)` for the current
single-attempt behavior; revisit if retries become real attempts. Index
`(tenant_id, status, created_at)`. Current `is_resolved` remains an API/property
alias derived from `resolved_at` during transition.

### 6.21 `ai_usage_logs` — keep and merge `ai_usage`

Columns: `id UUID !`; `tenant_id UUID !`; `conversation_id UUID ?`;
`message_id UUID ?`; `model VARCHAR(100) !`; `stage VARCHAR(50) ?`;
`intent VARCHAR(100) ?`; `input_tokens INTEGER !`; `output_tokens INTEGER !`;
`cost_usd_micro BIGINT !`; `latency_ms INTEGER ?`; `success BOOLEAN !`;
`error_code VARCHAR(100) ?`; `error TEXT ?`; `created_at TIMESTAMPTZ !`.

FK tenant cascade; same-tenant conversation/message set null. Indexes
`(tenant_id, created_at DESC)`, `(tenant_id, model, created_at)`, and
`(success, created_at)` for operations. No `updated_at`: usage is immutable.

Legacy `ai_usage.tokens_in/out`, `cost_usd`, `intent`, and `message_id` map into this
table. USD cost converts to integer micro-dollars with an explicit rounding rule.

### 6.22 `audit_logs` — keep, preserve stronger legacy detail

Columns: `id UUID !`; `tenant_id UUID ?`; `tenant_user_id UUID ?`;
`action VARCHAR(100) !`; `resource_type VARCHAR(100) ?`; `resource_id UUID ?`;
`details JSONB ?`; `old_values JSONB ?`; `new_values JSONB ?`;
`ip_address INET ?`; `user_agent TEXT ?`; `request_id VARCHAR(100) ?`;
`created_at TIMESTAMPTZ !`.

Tenant may be null only for platform-admin events. Tenant-user uses set null. Indexes
`(tenant_id, created_at DESC)`, `(resource_type, resource_id)`,
`(tenant_user_id, created_at DESC)`, and `request_id`. Immutable; no `updated_at`.

### 6.23 `notifications` — keep

Columns: `id UUID !`; `tenant_id UUID !`; `tenant_user_id UUID ?`;
`title VARCHAR(255) !`; `body TEXT ?`; `type VARCHAR(50) !`; `is_read BOOLEAN !`;
`read_at TIMESTAMPTZ ?`; `link TEXT ?`; timestamps `!`.

FK tenant cascade; same-tenant user cascade or set null based on whether a
notification is personal or tenant-wide. Indexes `(tenant_id, is_read, created_at
DESC)` and `(tenant_user_id, is_read, created_at DESC)`. Preserve current `user_id`
as a transitional alias for `tenant_user_id`.

### 6.24 `scheduled_tasks` — keep configuration records

Columns: `id UUID !`; `tenant_id UUID !`; `name VARCHAR(255) !`;
`task_type VARCHAR(100) !`; `cron_expression VARCHAR(100) ?`; `payload JSONB !`;
`is_active BOOLEAN !`; `last_run_at TIMESTAMPTZ ?`; `next_run_at TIMESTAMPTZ ?`;
timestamps `!`.

FK tenant cascade. Indexes `(tenant_id, is_active, next_run_at)` and `task_type`.
This table does not replace Celery's delivery/retry state; it stores tenant schedule
configuration only.

## 7. Useful legacy SQL fields to preserve

Preserve through canonical columns or explicit migration mapping:

- Tenant address, city, timezone, branding, description, trial end, displayed
  WhatsApp number, and webhook secret reference.
- Customer WhatsApp ID, avatar, last-seen timestamp, and array tags.
- Conversation channel, message count, last-message time, AI-handled flag, and
  resolution time.
- Message media, intent, token, latency, and delivery lifecycle fields.
- Order conversation, discount, delivery fee/address/notes/time, and currency.
- Booking conversation/staff links and cancellation metadata.
- Payment customer, receipt/result details, and lifecycle timestamps.
- Subscription usage limits.
- Audit old/new values and user agent.

Do not preserve the unsupported `vector(1536)` column yet. Do not preserve product
`is_service` as canonical; inventory it before retirement.

## 8. Current ORM names that must remain behavior-compatible

The following names are directly used by current schemas, services, workers, AI
routing, or frontend API types:

| Name | Dependency |
|---|---|
| `Tenant.business_name` | tenant APIs, AI business context, frontend profile/signup |
| `business_type`, `template_key` | onboarding, settings, template assignment |
| `wa_phone_number_id`, `wa_access_token` | webhook tenant routing and WhatsApp send |
| `mpesa_shortcode` | AI payment instructions |
| `ai_agent_name`, `ai_tone`, `ai_language`, `ai_custom_instructions`, `ai_strictness` | settings and AI prompt construction |
| `Customer.name`, `phone`, `total_orders`, `total_spent`, `wa_opt_in` | CRUD schemas, search, AI customer lookup |
| `Product.price`, `stock_quantity` | product API contract |
| `Conversation.customer_phone`, `status`, `unread_count`, `updated_at` | inbox service, AI lookup, response schemas |
| `Message.wa_message_id`, `direction`, `content`, `message_type`, `ai_stage`, `is_read` | webhook idempotency, AI logs, inbox schemas |
| `Order.subtotal`, `total`, `channel`, `order_number`, `status` | order service, analytics, API schemas |
| `OrderItem.product_name`, `unit_price`, `total_price` | order creation and response schemas |
| `Booking.duration_minutes`, `reminder_sent`, `scheduled_at`, `status` | APIs and Celery reminders |
| `Payment.customer_phone`, `mpesa_checkout_id`, `mpesa_receipt`, `failure_reason` | payment schema and worker |
| `Subscription.amount_kshs`, `status` | admin MRR calculation and schemas |
| `ConversationState.data` dictionary behavior | AI state machine |
| `AiUsageLog.input_tokens`, `output_tokens`, `cost_usd_micro` | usage analytics |

Canonical model changes must either retain these Python attributes or provide
mapped synonyms/properties while API response schemas remain unchanged.

## 9. Backward-compatible API requirements

The existing endpoints and frontend must continue seeing:

- Tenant responses with `business_name`, `industry`, `plan`, `status`,
  `wa_connected`, `ai_tone`, and `ai_language`.
- Settings responses with current AI field names and M-Pesa/WhatsApp booleans.
- Integer JSON money values under existing names until an API version explicitly
  documents minor units.
- Customer tags in the currently accepted shape until a coordinated schema change.
- Conversation `unread_count` in the current response shape, even though the
  database becomes integer.
- Booking `duration_minutes` and current reminder behavior.
- Order item `product_name`, `unit_price`, and `total_price`.
- Existing status strings accepted by current routes.
- Feature endpoints returning feature keys, not internal IDs.

Compatibility belongs in ORM mappings and Pydantic schemas, not duplicate database
columns maintained indefinitely.

## 10. Minimal canonical foundation before new modules

Before adding new business modules, NURA needs only:

- One reproducible Alembic history.
- The 24 tables above with explicit types and constraints.
- One identity/membership model (`tenant_users`).
- One AI usage model (`ai_usage_logs`).
- Consistent UUID, timestamp, JSONB, and minor-unit money conventions.
- Explicit enum names and a single enum family.
- Direct `tenant_id` on all tenant-owned records.
- Same-tenant relationship enforcement.
- Webhook idempotency index.
- Reliable audit and message lifecycle storage.
- Tests proving fresh and legacy upgrades converge to the same schema.

RLS should follow this relational foundation; enabling it before application
transaction context is implemented would break normal traffic.

## 11. Option C migration repair design

### Track A: clean baseline for empty databases

1. Freeze and review this canonical specification.
2. Update ORM models in a dedicated implementation phase.
3. Create a reviewed baseline migration manually, using autogenerate only as a
   comparison aid in an isolated database.
4. Upgrade an empty supported PostgreSQL instance to head.
5. Seed reference data separately and idempotently.
6. Produce a normalized schema fingerprint.

The clean baseline is never applied to a legacy database that already has tables.

### Track B: legacy/hybrid adoption

1. Capture schema fingerprints and data inventories for every environment.
2. Classify each environment: complete legacy SQL, partial SQL plus ORM, ORM-only,
   or already canonical.
3. Add new canonical columns and types without dropping old objects.
4. Backfill with explicit, tested mappings.
5. Validate nullability, enum values, uniqueness, same-tenant relationships, money
   interpretation, and row reconciliation.
6. Cut application reads/writes to canonical columns.
7. Mark the database at the matching adoption revision only after its fingerprint
   equals the expected pre-head fingerprint.
8. Retire legacy objects in a later release after rollback windows expire.

### Schema fingerprint

The fingerprint comparison must normalize and compare:

- tables and columns, including type, nullability and defaults;
- PK, FK, unique and check constraints;
- indexes and partial predicates;
- named enum types and ordered values;
- extensions, sequences, functions, triggers and RLS policies;
- current Alembic revision.

Constraint/index names should be deterministic through an Alembic naming
convention. Environment-specific object IDs and physical storage details are not
part of the fingerprint.

Both tracks must finish at the same canonical fingerprint before `create_all()` or
the Docker SQL bootstrap is removed.

## 12. Tests required before migration edits

1. Real PostgreSQL test fixture isolated from developer data.
2. Empty database upgrade to head.
3. Fixture reproducing full legacy `schema.sql` behavior.
4. Fixture reproducing the observed partial/hybrid database.
5. ORM-only fixture produced by current `create_all()`.
6. Fingerprint equality across all successful upgrade paths.
7. Alembic head and single-head assertions.
8. Migration failure/rollback tests around each backfill stage.
9. Data reconciliation tests for every renamed/merged column.
10. Money interpretation and conversion tests using known UI/business examples.
11. Enum value mapping and duplicate-enum retirement tests.
12. `users` to `tenant_users` conflict and membership tests.
13. `ai_usage` to `ai_usage_logs` token/cost reconciliation tests.
14. Foreign-key orphan detection and same-tenant relationship tests.
15. Customer phone, tenant feature, SKU, receipt, and WhatsApp-ID uniqueness tests.
16. Existing API contract tests against real PostgreSQL.
17. AI order/booking/conversation flow integration tests against real PostgreSQL.
18. Seed idempotency tests.
19. Application and worker startup at head without `create_all()` in an isolated
    proof environment.
20. Backup restore rehearsal followed by fingerprint and row reconciliation.

## 13. Files recommended for the next implementation phase

Do not change these until the schema decisions and migration test design are
approved.

Migration-test infrastructure first:

- `backend/tests/conftest.py`
- `backend/tests/migrations/` (new focused test package)
- `backend/tests/fixtures/schema/` (sanitized schema-state fixtures)
- `backend/app/core/database.py` only if isolated test-database configuration is
  required
- `backend/alembic/env.py` for naming convention/comparison configuration, after
  tests exist
- CI configuration, if present or added, to provide disposable PostgreSQL

Canonical model implementation second:

- Existing files under `backend/app/models/` only; no new business modules
- Matching existing Pydantic schemas where compatibility aliases are required
- Services/routes only where a renamed canonical column needs an ORM alias or
  explicit conversion

Migration implementation last:

- `backend/alembic/versions/` with a reviewed clean baseline/adoption strategy
- `docker-compose.yml`, `database/schema.sql`, and `backend/app/main.py` only after
  both migration tracks are proven; initially retain them unchanged

## 14. Decisions that remain deliberately deferred

- Extracting tenant fields into a separate business-profile table.
- Supporting multiple simultaneous tenant memberships in the UI/auth flow.
- A separate services catalog.
- RAG/vector storage.
- Splitting conversation lifecycle from human/bot handling mode.
- Payment provider automation and live STK behavior.
- Full workflow/automation execution models.
- All new industry/business modules.

These decisions must not block repair of the existing schema foundation.
