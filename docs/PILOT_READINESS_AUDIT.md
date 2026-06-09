# NURA — Pilot Readiness Audit

> Purpose: Can a bakery owner, salon owner, or travel agent understand and use NURA in 30 seconds?
> Honest UX assessment before adding any more features.

---

## The Core Test

Before any code is written, ask this:

> *"If I run a bakery and I land on this platform, can I understand what NURA does,
> how I get started, and why I should trust it — in 30 seconds?"*

Current answer: **No.** Here is why, page by page.

---

## Landing Page (`/`)

**Goal:** Convince a Kenyan SME owner to start a trial.

**Problems:**
- Hero headline is product-oriented ("AI Business Assistant") not outcome-oriented
- A bakery owner needs to see: "Never miss an order on WhatsApp again" or "Your WhatsApp sells for you while you sleep"
- No concrete KES revenue numbers ("businesses earn KES 40K+ extra per month")
- Copy uses developer language — "AI router", "multi-tenant", "webhook"
- No social proof for Kenya specifically (trust signal: "Trusted by 3 Nairobi businesses")
- No video demo — bakery owners won't read text, they need to see the product working in 30 seconds
- CTA says "Get Started" — for which use case? Salon? Bakery? Tour company?
- Pricing section shows plan names but "TBD by Boss" — no numbers = no conversion

**Fixes needed:**
- Rewrite hero: "Your WhatsApp, now with an AI assistant that takes orders, books appointments, and chases payments — even when you're busy."
- Add 3 concrete outcome cards with KES numbers (borrow from pilot businesses)
- Replace "Get Started" with use-case CTAs: "I run a salon / I run a bakery / I run a tour company"
- Add a 60-second WhatsApp demo video above the fold
- Remove all technical language from the public site

---

## Sign Up (`/sign-up`)

**Goal:** Create an account in under 60 seconds.

**Problems:**
- Form asks for: email + password. That's fine.
- BUT — after signup, what happens? There is no auto-redirect to onboarding.
- New user lands on dashboard with empty state and no guidance.
- Dashboard setup checklist exists but is hardcoded static data — it doesn't respond to whether the user has actually completed steps.

**Fixes needed:**
- After signup → immediately redirect to `/onboarding`
- Onboarding must auto-trigger on first login, not be a page users accidentally find
- "Check your email to confirm" step will lose most Kenyan SME owners. Consider phone OTP instead for verification (already built in backend).

---

## Onboarding (`/onboarding`)

**Goal:** Connect WhatsApp and become operational in one session.

**Problems:**
- Step 1 (role selection: Owner / Manager / Staff / Sales Agent) is unnecessary friction. 90% of users are owners. Remove this step.
- Step 2 (business type — 8 cards) does NOT assign a template. Selecting "Bakery" does nothing to configure the AI differently.
- Step 3 (business name) shows "Nura from {name}" preview — this is good!
- Step 4 (phone OTP) — good, but backend OTP endpoint needs to work.
- Step 5 (success) — says "AI assistant ready to go!" but WhatsApp is not connected yet. This is a **false promise**.
- Missing from onboarding entirely: Connect WhatsApp (the most critical step).
- Missing: Add your first product / service.
- Missing: Test your AI (send a test message).

**Fixes needed:**
- Remove Step 1 (role selection)
- Step 2 (business type) must call `POST /features/tenant-features/assign` with the selected template
- Add Step 5: "Connect WhatsApp" — this should be the climax of onboarding, not an afterthought
- Add Step 6: "Add your first 3 products / services" — the AI cannot help if it has no catalog
- Success screen should only say "You're live!" AFTER WhatsApp is actually connected

---

## Dashboard (`/dashboard`)

**Goal:** Show business value immediately. Owner sees what matters.

**Problems (critical — this is the "developer dashboard" problem):**
- Dashboard shows hardcoded static chart data (Mon–Sun revenue chart with fake numbers)
- Stats cards (Revenue, Orders, Messages, Bookings) are NOT wired to real API
- "AI Agent Status" toggle works (Redis-backed) — this is good
- Setup checklist exists but is static — doesn't update when steps are completed
- Chart uses indigo/purple colors (`stroke="#6366f1"`) — not the brand blue
- NO "Today" summary card showing: new messages, orders waiting, bookings today, revenue today
- The most urgent thing for a bakery owner: "3 orders waiting for confirmation" — this is not visible at all
- Inbox link exists but goes to `/inbox` which is complex — owner needs simple "you have 3 unread messages"

**What it should look like (per Frozen Scope spirit):**
```
TODAY — Tuesday
[12 New Messages]  [3 Orders Waiting ⚠️]  [2 Bookings]  [KES 15,400]
[Open WhatsApp Inbox]  [Confirm Orders]  [View Bookings]
```

**Fixes needed:**
- Wire all 4 stat cards to `GET /analytics/overview?days=1` (today's numbers)
- Add "Orders Waiting" urgent card with badge count and direct link
- Make setup checklist dynamic — check API for each completion state
- Remove or reduce chart until real data exists
- The owner's first question: "Is my AI on?" — make the toggle the most prominent element

---

## Customers (`/customers`)

**Goal:** Manage customer relationships.

**Problems:**
- Table shows: Name, Phone, Total Orders, Total Spent, Last Active — correct
- Search works in UI but is not wired to `GET /customers?search=`
- "Send Message" button does nothing
- No way to see conversation history for a customer
- Customer detail page (`/customers/[id]`) exists — good

**Fixes needed:**
- Wire search to backend
- "Send Message" → opens WhatsApp conversation for that customer
- Customer detail: show last 5 messages from that customer's conversations

---

## Orders (`/orders`)

**Goal:** Owner confirms orders, triggering payment.

**Problems (this is P0 — the entire revenue flow):**
- Orders list exists as a page
- "Confirm Order" button — does it call `PATCH /orders/{id}/status` AND trigger STK push? Currently unclear — likely not wired.
- Owner gets no notification when a new order comes in (no WhatsApp alert, no dashboard push)
- No visual distinction between "1 minute ago" and "3 hours ago" pending orders
- No escalation indicator ("⚠️ 45 minutes unconfirmed")

**Fixes needed:**
- Confirm button must: (1) update order status to confirmed, (2) trigger STK push to customer
- Add timestamp + "overdue" badge for orders waiting >30 minutes
- Real-time update via polling or Socket.IO so owner sees new orders without refreshing

---

## Bookings (`/bookings`)

**Goal:** Manage appointments.

**Problems:**
- UI has list + calendar toggle — good structure
- "Today's appointments" section exists
- NOT connected to Google Calendar (the actual source of truth for salons)
- AI books appointments via state machine but they appear in NURA DB only, not owner's phone calendar
- No WhatsApp reminder sending from this page

**Fixes needed:**
- Google Calendar integration is P1 for salon pilot
- "Confirm" button on booking should send WhatsApp confirmation to customer
- Upcoming reminders: show "Reminder will send in 2 hours" status

---

## Mobile Experience

**Problem statement:** Kenyan SME owners primarily use smartphones, not laptops. The entire dashboard is designed desktop-first.

**Issues:**
- Sidebar collapses on mobile (hamburger menu) — needs testing
- Inbox page with split pane (conversation list + chat view) will be unusable on mobile
- Orders table: 6 columns on a 390px screen = impossible to read
- Booking calendar view: completely broken on mobile
- Dashboard charts: may render too small to be useful

**Fixes needed:**
- Every table must have a mobile card view alternative
- Inbox: on mobile, it must be full-screen chat list → tap → full-screen chat (like WhatsApp)
- Most critical mobile screens: Dashboard summary, Orders confirmation, Inbox

---

## Navigation Audit

The current sidebar has these items. Review each against "Would a bakery owner ever click this?":

| Item | Bakery Owner Needs It? | Verdict |
|------|----------------------|---------|
| Dashboard | Yes — first thing they see | ✅ Keep, fix content |
| Inbox | Yes — their conversations | ✅ Keep, simplify |
| Orders | Yes — confirm and get paid | ✅ Keep, make prominent |
| Bookings | Only for salons/clinics | 🟡 Hide for non-booking businesses |
| Customers | Yes — who are my customers | ✅ Keep |
| Products | Yes — what am I selling | ✅ Keep |
| Campaigns | No — post-launch feature | ❌ Move to Settings or hide |
| Branches | No — almost no SME has branches | ❌ Hide or remove |
| Knowledge | Only setup time, not daily use | 🟡 Move to Settings > AI |
| AI Settings | Only setup time, not daily use | 🟡 Move to Settings |
| Billing | Rarely needed | 🟡 Move to Settings |
| Staff | v2 feature | ❌ Hide until multi-agent is built |
| Integrations | Setup time only | 🟡 Move to Settings |

**Recommended sidebar for pilot:**
```
📊 Dashboard
💬 Inbox
📦 Orders
📅 Bookings (hidden if use_case = "sell")
👥 Customers
🛍️ Products
⚙️ Settings
```

---

## The Biggest UX Problem

The dashboard currently looks like:
> **"Developer monitoring tool"**

It should look like:
> **"My business command center"**

The single most important change before pilot: **The dashboard must show today's business, not all-time metrics.**

A bakery owner who opens the app at 8am wants to see:
- How many WhatsApp messages came in overnight
- Whether any orders need confirming right now
- Whether the AI is on

They do NOT want to see:
- AI model performance charts
- Token usage
- System status panels
- "7-day rolling average" charts on an empty database

---

## Pre-Pilot Priority Order

### Must Do (blocks pilot entirely)
1. Wire Meta Embedded Signup → owner can actually connect their WhatsApp
2. AI router must call send_list() and send_buttons() (plain text AI is not the product)
3. Owner gets WhatsApp notification when order comes in
4. "Confirm Order" button triggers STK push
5. Onboarding assigns business template to tenant

### Should Do (pilot will feel broken without these)
6. Lead capture on every conversation
7. Dashboard "Today" stats wired to real API
8. Orders page shows "overdue" indicator
9. Customer consent message on first interaction (ODPC)
10. Booking reminders via WhatsApp

### Can Wait (do after first pilot conversation)
11. Google Calendar (manual availability for first pilot)
12. Messenger + Instagram
13. Admin document review flow
14. Mobile polish pass
15. Prompt caching

---

*This document should be updated after each pilot session with real observations.*
*The goal is not a technically impressive system. The goal is a bakery owner who says: "This just works."*
