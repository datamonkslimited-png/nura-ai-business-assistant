# NURA — Scope Audit vs. DataMonks Frozen Scope v2.1

> Audited: June 2026 | Auditor: Claude (Cowork) | Source: DataMonks Frozen Scope v2.1 (April 2026)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully Implemented |
| 🟡 | Partially Implemented |
| 🖼️ | UI Only (no backend wiring) |
| ❌ | Missing |

---

## Audit Matrix

### 1. Feature Registry System
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Feature model (key, name, category) | ✅ | `backend/app/models/feature.py` — `Feature` class |
| BusinessTemplate model (bundle of features) | ✅ | `backend/app/models/feature.py` — `BusinessTemplate`, `TemplateFeature` |
| TenantFeature assignment model | ✅ | `backend/app/models/feature.py` — `TenantFeature` |
| Seed data: 13 features defined | ✅ | `backend/app/seeds/features_seed.py` — faq_bot, order_taking, multi_item_cart, booking, google_calendar, mpesa_stk, mpesa_passive, human_handoff, lead_capture, order_escalation, analytics, bulk_campaigns, product_catalog |
| API: list templates | ✅ | `backend/app/api/v1/endpoints/features.py` — GET /features/templates |
| API: list features | ✅ | `backend/app/api/v1/endpoints/features.py` — GET /features/features |
| API: get tenant features | ✅ | `backend/app/api/v1/endpoints/features.py` — GET /features/tenant-features |
| API: assign template to tenant | ✅ | `backend/app/api/v1/endpoints/features.py` — POST /features/tenant-features/assign |
| AI router checks tenant features before running | ❌ | `backend/app/ai/router.py` — no feature gate check before serving responses |
| Frontend: Feature assignment UI for tenant | ❌ | No frontend page under (dashboard)/ reads or displays tenant features |

**Overall: 🟡 Partially Implemented** — Data model and APIs complete; AI router and frontend UI do not use feature flags at runtime.

---

### 2. Templates System (Pilot Business Templates)
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Salon & Spa template | ✅ | `backend/app/seeds/features_seed.py` — key: "salon" with booking, google_calendar, human_handoff, lead_capture, analytics |
| Bakery & Food template | ✅ | `backend/app/seeds/features_seed.py` — key: "bakery" with full order flow + mpesa + escalation |
| Tour & Safari template | ✅ | `backend/app/seeds/features_seed.py` — key: "travel" with faq_bot, human_handoff, lead_capture |
| Clinic & Pharmacy template | ✅ | `backend/app/seeds/features_seed.py` — key: "clinic" |
| Retail Shop template | ✅ | `backend/app/seeds/features_seed.py` — key: "retail" |
| Templates surfaced in onboarding UI | ❌ | `frontend/src/app/onboarding/page.tsx` Step 2 has 8 business type cards but does NOT call GET /features/templates or assign a template on selection |

**Overall: 🟡 Partially Implemented** — Templates exist in DB seed; onboarding step 2 does not wire to them.

---

### 3. Business Feature Assignment
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Admin can assign features to tenant | 🟡 | `backend/app/api/v1/endpoints/admin.py` — no feature assignment endpoint; tenant-level assignment only exists via tenant self-service |
| Tenant can apply template during onboarding | ❌ | `frontend/src/app/onboarding/page.tsx` — no API call to assign template |
| Dashboard adapts to enabled features | ❌ | `frontend/src/app/(dashboard)/dashboard/page.tsx` — shows all sections regardless of tenant features |

**Overall: ❌ Missing** — No admin-to-tenant feature assignment. Dashboard does not adapt.

---

### 4. Conversation State Machine
| Requirement | Status | Evidence |
|-------------|--------|---------|
| State model (flow, step, data, expires_at) | ✅ | `backend/app/models/conversation_state.py` — ConversationState with flow/step/JSON data |
| StateService (get, set, clear) | ✅ | `backend/app/services/state_service.py` — get_state, set_state, clear_state |
| Order flow: idle → browsing → qty → address → confirmation → placed | ✅ | `backend/app/ai/router.py` — `_build_state_instructions()` + `_advance_state()` |
| Booking flow: idle → service → date → time → confirmed | ✅ | `backend/app/ai/router.py` — `_build_state_instructions()` |
| Auto-create Order record on state completion | ✅ | `backend/app/ai/router.py` — `_create_order()` called when flow reaches "placed" |
| Auto-create Booking record on state completion | ✅ | `backend/app/ai/router.py` — `_create_booking()` |
| State expires after inactivity | 🟡 | `backend/app/models/conversation_state.py` — expires_at column exists; no Celery task to enforce expiry |
| Multi-item cart persisted in state | ✅ | `backend/app/ai/router.py` — cart array in state_data JSON, merged across turns |

**Overall: ✅ Substantially Implemented** — Core machine is solid. Expiry enforcement is a gap.

---

### 5. AI Router (Stage 1 / 2 / 3)
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Stage 1: Deterministic (greeting, price, order, booking, human, payment) | ✅ | `backend/app/ai/router.py` — `classify_deterministic()` with Swahili + English regex patterns |
| Stage 2: Claude Haiku (classify + reply) | ✅ | `backend/app/ai/router.py` — `classify_with_haiku()` |
| Stage 3: Claude Sonnet (complex reasoning) | ✅ | `backend/app/ai/router.py` — `reply_with_sonnet()` |
| Dynamic system prompt (agent name, tone, catalog, FAQs, hours, strictness) | ✅ | `backend/app/ai/router.py` — system prompt builder loads from business_context dict |
| Business hours awareness | ✅ | `backend/app/ai/router.py` — `is_business_open()`, sets expectation message if closed |
| AI strictness (strict / flexible) | ✅ | `backend/app/ai/router.py` + `backend/app/models/tenant.py` — ai_strictness field, strict/flexible instruction injected |
| Swahili / English code-switching | ✅ | `backend/app/ai/router.py` — "Reply in the same language the customer uses (Swahili or English)" |
| Lead capture (Haiku secondary call) | ❌ | `backend/app/ai/router.py` — no secondary Haiku call for lead extraction visible |
| Log AI call to AiUsageLog | ❌ | `backend/app/ai/router.py` — AiUsageLog model exists but no write calls in router |
| Prompt caching (reduce input cost 50-90%) | ❌ | No `cache_control` or `ephemeral` blocks in any API calls |
| ODPC customer consent notice on first interaction | ❌ | `backend/app/ai/router.py` — no first-interaction consent message |

**Overall: 🟡 Partially Implemented** — Core 3-stage logic solid. Lead capture, usage logging, prompt caching, and ODPC consent are missing.

---

### 6. WhatsApp Coexistence
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Explanation that client keeps their Business App | ✅ | `docs/SETUP.md` — documented |
| Webhook receiver (GET verification + POST handler) | ✅ | `backend/app/api/v1/endpoints/webhooks.py` |
| X-Hub-Signature-256 verification | ✅ | `backend/app/api/v1/endpoints/webhooks.py` — hmac.compare_digest |
| Message deduplication via wa_message_id | 🟡 | `backend/app/models/message.py` — wa_message_id column; no deduplication check in webhook handler |
| Coexistence embedded signup / QR scan flow | ❌ | No implementation found in any backend or frontend file |
| Chat history sync (6 months) on connect | ❌ | Not implemented |
| Dashboard "Connect WhatsApp" button triggers actual flow | 🖼️ | `frontend/src/app/(dashboard)/settings/page.tsx` — WhatsApp tab UI exists; no Meta API call wired |

**Overall: 🟡 Partially Implemented** — Webhook infrastructure is complete. The coexistence onboarding flow (the actual product pitch) is missing.

---

### 7. Meta Embedded Signup
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Embedded signup UI flow (Facebook Login for Business) | ❌ | Not implemented anywhere |
| OAuth handshake with Meta | ❌ | Not implemented |
| Store wa_phone_number_id + wa_access_token | 🟡 | `backend/app/models/tenant.py` — fields exist; no endpoint to receive them from Meta OAuth callback |
| Fernet encryption of access token at rest | ❌ | `backend/app/models/tenant.py` — wa_access_token stored as plain Text |

**Overall: ❌ Missing** — Fields exist in DB. No implementation.

---

### 8. Google Calendar Integration
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Feature key exists in registry | ✅ | `backend/app/seeds/features_seed.py` — "google_calendar" feature |
| OAuth authorization flow (Connect Calendar button) | ❌ | Not implemented |
| Check availability via Calendar API | ❌ | Not implemented |
| Book slot and create Calendar event | ❌ | Not implemented |
| Appointment reminders via WhatsApp template | 🟡 | `backend/app/workers/tasks.py` — reminder task framework exists, calls `_send_booking_reminder()` stub |
| Frontend "Connect Google Calendar" settings tab | ❌ | `frontend/src/app/(dashboard)/settings/page.tsx` — no Google Calendar tab |
| AI offers available slots as reply buttons | ❌ | `backend/app/ai/router.py` — booking flow collects date/time via text, no Calendar availability check |

**Overall: ❌ Missing** — Feature flag exists. No actual integration.

---

### 9. M-Pesa Payment Modes
| Requirement | Status | Evidence |
|-------------|--------|---------|
| STK push triggered ONLY after owner confirms | ✅ | `backend/app/api/v1/endpoints/mpesa.py` — STK push is a POST endpoint requiring explicit call; not auto-triggered |
| STK push — Daraja OAuth + request | ✅ | `backend/app/integrations/mpesa.py` — `get_access_token()`, `stk_push()` |
| STK query (check payment status) | ✅ | `backend/app/integrations/mpesa.py` — `stk_query()` |
| Callback parsing | ✅ | `backend/app/integrations/mpesa.py` — `parse_stk_callback()` |
| Paste-fallback: extract M-Pesa confirmation from text | ✅ | `backend/app/integrations/mpesa.py` — `extract_mpesa_confirmation()` regex extraction |
| M-Pesa state machine (pending → stk_sent → verified → paid / timeout → manual_reconcile) | ❌ | `backend/app/models/payment.py` — only basic pending/completed/failed status; no stk_sent or manual_reconcile states |
| Idempotency keys on every transaction | ❌ | Not implemented |
| Reconcile pending payments Celery task | 🟡 | `backend/app/workers/tasks.py` — reconcile task registered in beat but body is stub |
| Phone normalization (07xx → 2547xx) | ✅ | `backend/app/integrations/mpesa.py` — `_normalize_phone()` |
| Mpesa callback webhook endpoint | ✅ | `backend/app/api/v1/endpoints/mpesa.py` — POST /mpesa/webhooks/mpesa/callback |

**Overall: 🟡 Partially Implemented** — Core STK flow and paste-fallback are solid. State machine and idempotency are missing.

---

### 10. Order Escalation Chain
| Requirement | Status | Evidence |
|-------------|--------|---------|
| OrderEscalation model (stage, sent_at, acknowledged_at) | ✅ | `backend/app/models/order_escalation.py` |
| 30-min: WhatsApp notification to owner | ✅ | `backend/app/workers/tasks.py` — whatsapp_1 stage at 30 min |
| 2-hr: Dashboard notification + email | ✅ | `backend/app/workers/tasks.py` — dashboard stage at 2 hr |
| 6-hr: Auto-timeout message to customer | ✅ | `backend/app/workers/tasks.py` — auto_timeout stage at 6 hr |
| Escalation Celery beat task registered | ✅ | `backend/app/workers/celery_app.py` — check_order_escalations every 5 min |
| Email send wired to real email service | ❌ | `backend/app/workers/tasks.py` — email escalation stage is a stub log only |
| SMS backup channel at 2-hr mark | ❌ | Spec says SMS via backup channel. Not implemented. |

**Overall: 🟡 Partially Implemented** — Model and schedule solid. Email/SMS not wired.

---

### 11. Handoff Logic
| Requirement | Status | Evidence |
|-------------|--------|---------|
| HANDOFF intent detection (Stage 1 + Stage 2) | ✅ | `backend/app/ai/router.py` — HUMAN_NEEDED intent pattern |
| Transparent message to customer on handoff | ✅ | `backend/app/ai/router.py` — "Of course! I'll connect you with our team right away." |
| Business owner notified on handoff | 🟡 | `backend/app/ai/router.py` — `_trigger_handoff()` calls `logger.info` and creates notification; does NOT send WhatsApp message to owner |
| Conversation status set to "human" | 🟡 | `backend/app/models/message.py` — ConversationStatus has "human" state; not clearly set in `_trigger_handoff` |
| Owner can take over and release from inbox | 🖼️ | `frontend/src/app/(dashboard)/inbox/page.tsx` — UI exists; not wired to real backend state change |
| AI resumes with "Hi again!" on release | ❌ | Not implemented |

**Overall: 🟡 Partially Implemented** — Detection and customer message are solid. Owner notification and conversation state transition are incomplete.

---

### 12. Interactive WhatsApp Messages
| Requirement | Status | Evidence |
|-------------|--------|---------|
| send_text | ✅ | `backend/app/integrations/whatsapp.py` |
| send_buttons (max 3 reply buttons) | ✅ | `backend/app/integrations/whatsapp.py` — `send_buttons()` |
| send_list (tappable product/service cards, max 10 rows) | ✅ | `backend/app/integrations/whatsapp.py` — `send_list()` |
| send_template (pre-approved, for >24h window) | ✅ | `backend/app/integrations/whatsapp.py` — `send_template()` |
| send_image | ✅ | `backend/app/integrations/whatsapp.py` — `send_image()` |
| AI router uses list message for product browsing | ❌ | `backend/app/ai/router.py` — AI reply is always plain text; no call to send_list() |
| AI router uses buttons for booking slot selection | ❌ | `backend/app/ai/router.py` — booking asks for date/time in text; no call to send_buttons() |
| Fallback to numbered text list for older WhatsApp | ❌ | Not implemented |

**Overall: 🟡 Partially Implemented** — All message types are built. The AI router never calls them — it only sends plain text responses.

---

### 13. AI Usage Logs
| Requirement | Status | Evidence |
|-------------|--------|---------|
| AiUsageLog model (model, stage, tokens, cost, latency) | ✅ | `backend/app/models/ai_usage_log.py` |
| Write log after every AI call in router | ❌ | `backend/app/ai/router.py` — no write to AiUsageLog |
| Admin API to read usage by tenant | ❌ | `backend/app/api/v1/endpoints/admin.py` — no AI usage endpoint |
| Admin dashboard AI monitoring page | ✅ | `frontend/src/app/(admin)/admin/ai-monitoring/page.tsx` — page exists |
| Admin dashboard wired to real usage data | ❌ | Admin AI monitoring page likely uses static/mock data |

**Overall: 🟡 Partially Implemented** — Model exists. Nothing writes to it.

---

### 14. Feature-Aware Dashboards
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Starter plan: show FAQ, catalog, lead capture | ❌ | `frontend/src/app/(dashboard)/dashboard/page.tsx` — no feature flag check |
| Growth plan: show orders, bookings, handoff | ❌ | Dashboard shows all sections regardless of plan/features |
| Business plan: show M-Pesa section | ❌ | Not gated |
| Dashboard setup checklist (Connect WhatsApp, Add Products, Test AI, Go Live) | 🟡 | `frontend/src/app/(dashboard)/dashboard/page.tsx` — setup checklist exists but is static hardcoded array |

**Overall: ❌ Missing** — Dashboard is not feature-aware.

---

### 15. Multi-Tenant RLS
| Requirement | Status | Evidence |
|-------------|--------|---------|
| RLS enabled on all tenant tables | ✅ | `database/schema.sql` — ALTER TABLE ... ENABLE ROW LEVEL SECURITY on 14 tables |
| tenant_isolation policy using current_setting | ✅ | `database/schema.sql` — CREATE POLICY tenant_isolation on customers, products, orders, bookings, messages, payments |
| app.current_tenant_id set on DB session | 🟡 | `backend/app/core/database.py` — needs verification that SET LOCAL is called per request |
| Business A cannot read Business B data | ✅ | Policy confirmed in schema |
| RLS on: conversations, messages, orders, products, customers | ✅ | `database/schema.sql` |
| RLS on: ai_usage, knowledge_documents, notifications, audit_logs | ✅ | `database/schema.sql` |

**Overall: ✅ Substantially Implemented** — Schema is correct. Runtime session variable wiring needs verification.

---

### 16. Admin Feature Assignment
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Admin can view all tenants | ✅ | `backend/app/api/v1/endpoints/admin.py` — GET /admin/tenants |
| Admin can set tenant status (active/suspended) | ✅ | `backend/app/api/v1/endpoints/admin.py` — PATCH /admin/tenants/{id}/status |
| Admin can assign features to a specific tenant | ❌ | No admin feature assignment endpoint |
| Admin can review onboarding documents | ❌ | No onboarding documents model or endpoint exists |
| Admin document approval → status active | ❌ | Not implemented |
| Admin subscriptions dashboard | 🖼️ | `frontend/src/app/(admin)/admin/subscriptions/page.tsx` — page exists, not wired |

**Overall: ❌ Missing** — Basic tenant management exists. Document review and feature override are absent.

---

### 17. Pilot Business Templates (Runtime Behavior)
| Requirement | Status | Evidence |
|-------------|--------|---------|
| Salon: AI handles booking inquiries | 🟡 | State machine has booking flow; no Google Calendar check |
| Salon: AI checks Google Calendar for availability | ❌ | Not implemented |
| Bakery: AI shows product list as interactive WhatsApp list | ❌ | AI sends plain text only |
| Bakery: Multi-item cart in conversation | ✅ | `backend/app/ai/router.py` — cart[] in state data |
| Bakery: M-Pesa STK after owner confirms | ✅ | Correct architecture (STK only on explicit API call) |
| Tour: AI collects lead brief (dates, group size, budget) | 🟡 | Booking flow collects some fields; no tour-specific quote flow |
| All: Customer consent notice on first interaction | ❌ | Not implemented |
| All: Order status WhatsApp notifications (placed→confirmed→preparing→delivered) | ❌ | Not implemented as template messages |
| All: Pharmacy — PPB doc required during onboarding | ❌ | No document upload model |
| All: Pharmacy — never auto-quote prescriptions | ❌ | No safety rule in AI router |

**Overall: 🟡 Partially Implemented** — The 3 pilot verticals can partially function but are missing key differentiating features.

---

## Summary

### A) What's Complete ✅

| Component | Location |
|-----------|----------|
| Feature registry data model (Feature, BusinessTemplate, TenantFeature, TemplateFeature) | `backend/app/models/feature.py` |
| Seed data: 5 templates × 13 features (salon, bakery, travel, clinic, retail) | `backend/app/seeds/features_seed.py` |
| Features API (list, get tenant features, assign template) | `backend/app/api/v1/endpoints/features.py` |
| Conversation state machine (model + service + flow transitions) | `backend/app/models/conversation_state.py`, `backend/app/services/state_service.py` |
| AI 3-stage router (deterministic → Haiku → Sonnet) | `backend/app/ai/router.py` |
| AI strictness setting (strict/flexible) in router | `backend/app/ai/router.py` |
| Business hours awareness | `backend/app/ai/router.py` — `is_business_open()` |
| Swahili/English code-switching | `backend/app/ai/router.py` |
| WhatsApp webhook (GET verify + POST handler + signature check) | `backend/app/api/v1/endpoints/webhooks.py` |
| All WhatsApp message types (text, buttons, list, template, image) | `backend/app/integrations/whatsapp.py` |
| M-Pesa STK push + query + callback + paste-fallback | `backend/app/integrations/mpesa.py` |
| Phone normalization (07xx → 2547xx) | `backend/app/integrations/mpesa.py` |
| Order escalation model + Celery chain (30min/2hr/6hr) | `backend/app/models/order_escalation.py`, `backend/app/workers/tasks.py` |
| HANDOFF detection + transparent customer message | `backend/app/ai/router.py` |
| Agent ON/OFF Redis toggle | `backend/app/services/agent_toggle_service.py` |
| Multi-item cart in state data | `backend/app/ai/router.py` |
| AiUsageLog model | `backend/app/models/ai_usage_log.py` |
| Multi-tenant RLS schema | `database/schema.sql` |
| Full tenant dashboard pages (inbox, orders, bookings, products, settings, analytics) | `frontend/src/app/(dashboard)/` |
| Admin dashboard pages | `frontend/src/app/(admin)/admin/` |
| Auth pages (sign-in, sign-up, forgot/reset password) | `frontend/src/app/(auth)/` |
| 5-step onboarding flow UI | `frontend/src/app/onboarding/page.tsx` |

---

### B) What's Partially Complete 🟡

| Component | What Exists | What's Missing |
|-----------|-------------|----------------|
| Feature-aware AI router | Feature model + API | Router never reads TenantFeature; all tenants get same behavior |
| WhatsApp Coexistence | Webhook + WA client | Embedded signup / QR scan flow not built |
| Handoff notification to owner | `_trigger_handoff()` logs and creates notification | Does NOT send a WhatsApp message to the owner's number |
| M-Pesa state machine | STK push + callback | stk_sent / timeout / manual_reconcile states missing; no idempotency keys |
| Order escalation | Model + schedule correct | Email stub only; SMS backup channel missing |
| Interactive messages in AI | All send_* methods built | AI router only ever calls send_text(); never triggers list/buttons |
| AI usage logging | AiUsageLog model | Nothing writes to it in router |
| Dynamic system prompt | Prompt builder reads from business_context | Products and FAQs must be pre-loaded into business_context from DB — verify this is happening |
| Lead capture | Intent routing exists | No secondary Haiku extraction call |
| Prompt caching | Using Anthropic SDK | cache_control blocks not added to API calls |
| Booking appointment reminders | Celery task framework | `_send_booking_reminder()` is a stub |
| Onboarding template selection | 8 business type cards in UI | Does not call assign_template API on selection |

---

### C) What's Missing ❌

| Requirement | Spec Reference |
|-------------|---------------|
| **Meta Embedded Signup** — Facebook Login for Business, OAuth handshake, receive phone_number_id + token | Spec §3.2, Week 2 sprint |
| **Google Calendar integration** — OAuth, availability check, slot booking, calendar event creation | Spec §5.6, Week 4 sprint |
| **Messenger + Instagram webhooks** — multi-channel handling, channel abstraction layer | Spec §2.3, Week 4 sprint |
| **Fernet encryption** — wa_access_token + Daraja credentials encrypted at rest | Spec §7.3 |
| **Onboarding document upload** — business reg, KRA PIN, M-Pesa details, PPB license, pending verification flow | Spec §3.2, §8 |
| **Admin document review** — admin approves documents → tenant becomes active | Spec §8 |
| **Admin feature assignment** — admin can override features per tenant | Spec §7 implied |
| **Customer consent notice** — first AI interaction, ODPC compliance | Spec §5.5 (implied), §7.1 |
| **Order status WhatsApp notifications** — placed/confirmed/preparing/dispatched/delivered via template messages | Spec §2.3 |
| **Appointment WhatsApp reminders** — 2hr + 24hr via approved template | Spec §5.6 |
| **WhatsApp template message approval** — submit 5-6 templates to Meta | Spec Week 5 |
| **Pharmacy AI safety rules** — never auto-quote prescriptions, route to pharmacist | Spec §5.7 |
| **PII masking in logs** — mask phone numbers in all log output | Spec §7.3 |
| **Real-time Socket.IO / SSE** — live conversation updates in inbox | Spec Week 6 |
| **S3 image upload** — product images, onboarding documents | Spec Week 2 |
| **State expiry enforcement** — Celery task to clear expired states | Minor |
| **AI "Hi again!" on handoff release** — AI resumes naturally after owner releases | Spec §5.4 |

---

### D) Must Build Before First Pilot Business

These are **blocking** for a working pilot. Nothing else matters until these are done.

| Priority | Item | Why Blocking |
|----------|------|-------------|
| 🔴 P0 | **Meta Embedded Signup + WhatsApp Coexistence flow** | Without this, no tenant can connect their WhatsApp. The entire product is unusable. |
| 🔴 P0 | **AI router calls send_list() and send_buttons()** | Spec: "tappable product lists" is the core product experience. Currently AI only sends plain text. |
| 🔴 P0 | **Lead capture (Haiku secondary call)** | Every conversation should save name + phone + intent. Currently nothing is captured. |
| 🔴 P0 | **AiUsageLog writes in router** | Must track per-tenant AI cost from day 1 to bill correctly |
| 🔴 P0 | **Owner WhatsApp notification on new order + handoff** | Owner has no idea an order came in. Core workflow is broken. |
| 🟠 P1 | **Onboarding template assignment** | Bakery gets a different AI than salon. Currently all tenants are identical. |
| 🟠 P1 | **Order status WhatsApp notifications** (placed, confirmed, preparing, delivered) | Customer never knows what happened after ordering. |
| 🟠 P1 | **Customer consent notice on first interaction** | ODPC compliance. Legal risk. |
| 🟠 P1 | **Booking appointment reminders** | Core promise to salon pilot ("AI sends reminder before appointment"). |
| 🟠 P1 | **Fernet encryption of wa_access_token** | Security requirement. Currently tokens stored in plain text. |
| 🟡 P2 | **Google Calendar integration** | Required for salon pilot. Can fake with manual availability for first demo. |
| 🟡 P2 | **M-Pesa state machine** (stk_sent, timeout, manual_reconcile) | Needed for bakery pilot. Can launch without if owner manually confirms receipt. |
| 🟡 P2 | **Admin document upload + review flow** | Needed to onboard a real business. Can bypass manually for first pilot. |
| 🟡 P2 | **Prompt caching** | Not blocking launch but cuts AI cost by 50-90%. Worth 1 hour to implement. |

---

*Generated June 2026. Compare against: DataMonks Frozen Scope v2.1, April 2026.*
