"""
NURA AI Router — 3-stage intelligent message processing.

Stage 1: Deterministic (pattern matching, no AI cost)
Stage 2: Claude Haiku (fast classification + simple replies)
Stage 3: Claude Sonnet (complex reasoning, context-aware responses)

Each stage only escalates if the previous stage cannot handle the message.

State machine transitions are written to DB after every AI turn so that
multi-step flows (order → quantity → address → placed) persist correctly.
"""
from __future__ import annotations

import re
import json
import time
import uuid
import random
import string
from datetime import datetime
from enum import Enum
from typing import Optional, Tuple
from loguru import logger
import anthropic
import pytz

from app.core.config import settings
from app.integrations.whatsapp import get_whatsapp_client


# ── AI client ────────────────────────────────────────────────────────────────
client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


# ── Intent enum ──────────────────────────────────────────────────────────────
class Intent(str, Enum):
    GREETING       = "greeting"
    ORDER          = "order"
    BOOKING        = "booking"
    PRICE_ENQUIRY  = "price_enquiry"
    PAYMENT        = "payment"
    DELIVERY       = "delivery"
    HOURS          = "hours"
    LOCATION       = "location"
    CANCEL         = "cancel"
    COMPLAINT      = "complaint"
    HUMAN_NEEDED   = "human_needed"
    UNKNOWN        = "unknown"


# ── Stage 1: Deterministic patterns ──────────────────────────────────────────
GREETING_PATTERNS = re.compile(
    r"\b(hi|hello|hey|hujambo|karibu|habari|sasa|niaje|mambo|oya|vipi)\b",
    re.IGNORECASE
)

PRICE_PATTERNS = re.compile(
    r"\b(price|bei|ngapi|how much|cost|charge|fee|rate)\b",
    re.IGNORECASE
)

ORDER_PATTERNS = re.compile(
    r"\b(order|nataka|niambie|nunua|buy|want|need|napenda|nipe)\b",
    re.IGNORECASE
)

BOOKING_PATTERNS = re.compile(
    r"\b(book|appointment|reserve|appoint|schedule|nafike|kuja|come)\b",
    re.IGNORECASE
)

PAYMENT_PATTERNS = re.compile(
    r"\b(pay|lipa|mpesa|pesa|money|cash|nimelipa|nipeleke)\b",
    re.IGNORECASE
)

HUMAN_PATTERNS = re.compile(
    r"\b(human|person|speak to|talk to|manager|supervisor|mtu)\b",
    re.IGNORECASE
)


def classify_deterministic(text: str) -> Optional[Intent]:
    """Stage 1: Pattern matching — instant, zero cost."""
    if HUMAN_PATTERNS.search(text):
        return Intent.HUMAN_NEEDED
    if GREETING_PATTERNS.search(text) and len(text.split()) <= 5:
        return Intent.GREETING
    if PAYMENT_PATTERNS.search(text):
        return Intent.PAYMENT
    if ORDER_PATTERNS.search(text):
        return Intent.ORDER
    if BOOKING_PATTERNS.search(text):
        return Intent.BOOKING
    if PRICE_PATTERNS.search(text):
        return Intent.PRICE_ENQUIRY
    return None


# ── Business hours check ──────────────────────────────────────────────────────
def is_business_open(business_context: dict) -> bool:
    """Check if current time is within business hours (Africa/Nairobi timezone)."""
    hours = business_context.get("hours", "")
    if not hours:
        return True  # Default to open if not set
    nairobi = pytz.timezone("Africa/Nairobi")
    now = datetime.now(nairobi)
    if now.weekday() >= 6:  # Sunday
        return False
    return 8 <= now.hour < 18


# ── Stage 2: Claude Haiku classification ─────────────────────────────────────
async def classify_with_haiku(
    message: str,
    business_context: dict,
    conversation_history: list[dict],
    current_state_flow: str = "idle",
    current_state_step: str = "",
) -> Tuple[Intent, str, str, dict]:
    """
    Stage 2: Use Claude Haiku to classify intent AND generate a reply.
    Fast and cheap. Used when deterministic fails.

    Returns (intent, reply_text, next_step, extracted_data)
    """
    knowledge_section = ""
    if business_context.get("knowledge"):
        knowledge_section = f"\n\nBusiness Knowledge Base:\n{business_context['knowledge']}"

    state_section = ""
    if business_context.get("state_context"):
        state_section = f"\n\nConversation State: {business_context['state_context']}"

    agent_name = business_context.get("agent_name", "Nura")
    custom_prompt = business_context.get("ai_custom_prompt", "")
    strictness = business_context.get("ai_strictness", "flexible")
    strictness_instruction = (
        "Only answer questions about products and services listed in the knowledge base. "
        "If not in the catalog, say you don't have that information."
        if strictness == "strict"
        else "You can answer general business questions helpfully."
    )

    state_instructions = _build_state_instructions(current_state_flow, current_state_step)

    system_prompt = (
        f"You are {agent_name}, an AI business assistant for {business_context.get('name', 'this business')}.\n"
        f"Business type: {business_context.get('type', 'retail')}\n"
        f"Language: Reply in the same language the customer uses (Swahili or English).\n"
        f"Tone: {business_context.get('ai_tone', 'friendly')}, professional, helpful. "
        f"Use 'Karibu!' for Swahili greetings.\n"
        f"{strictness_instruction}"
        f"{knowledge_section}"
        f"{state_section}"
        + (f"\n\nAdditional instructions: {custom_prompt}" if custom_prompt else "")
        + f"\n\n{state_instructions}"
        + "\n\nAvailable intents: greeting, order, booking, price_enquiry, payment, delivery, "
          "hours, location, cancel, complaint, human_needed, unknown\n\n"
          "Available next_step values: idle, order.browsing, order.awaiting_quantity, "
          "order.awaiting_address, order.awaiting_confirmation, order.placed, "
          "booking.awaiting_service, booking.awaiting_date, booking.awaiting_time, booking.confirmed\n\n"
          'Reply with JSON ONLY:\n'
          '{"intent": "<intent>", "reply": "<your response>", "next_step": "<next_step or idle>", '
          '"extracted": {"product": null, "qty": null, "address": null, "service": null, "date": null, "time": null}}\n'
          "Keep replies under 150 words. Be warm and helpful."
    )

    messages = conversation_history[-6:] + [{"role": "user", "content": message}]

    try:
        start = time.time()
        response = await client.messages.create(
            model=settings.AI_MODEL_FAST,
            max_tokens=350,
            system=system_prompt,
            messages=messages,
        )
        elapsed = time.time() - start
        logger.info(
            f"Haiku response in {elapsed:.2f}s | "
            f"tokens: {response.usage.input_tokens + response.usage.output_tokens}"
        )

        raw = response.content[0].text.strip()
        # Strip markdown fences if present
        if "```" in raw:
            raw = re.sub(r"```(?:json)?", "", raw).strip()

        parsed = json.loads(raw)
        intent = Intent(parsed.get("intent", "unknown"))
        reply = parsed.get("reply", "")
        next_step = parsed.get("next_step", "idle")
        extracted = parsed.get("extracted", {}) or {}
        return intent, reply, next_step, extracted

    except Exception as e:
        logger.error(f"Haiku classification failed: {e}")
        return Intent.UNKNOWN, "", "idle", {}


# ── Stage 3: Claude Sonnet full reasoning ────────────────────────────────────
async def reply_with_sonnet(
    message: str,
    intent: Intent,
    business_context: dict,
    conversation_history: list[dict],
    current_state_flow: str = "idle",
    current_state_step: str = "",
) -> Tuple[str, str, dict]:
    """
    Stage 3: Claude Sonnet for complex situations.
    Returns (reply, next_step, extracted_data)
    """
    knowledge_section = ""
    if business_context.get("knowledge"):
        knowledge_section = f"\nKnowledge Base:\n{business_context['knowledge']}\n"

    state_section = ""
    if business_context.get("state_context"):
        state_section = f"\nConversation State: {business_context['state_context']}\n"

    agent_name = business_context.get("agent_name", "Nura")
    custom_prompt = business_context.get("ai_custom_prompt", "")
    strictness = business_context.get("ai_strictness", "flexible")
    strictness_instruction = (
        "STRICT MODE: Only discuss products and services in the knowledge base."
        if strictness == "strict"
        else "FLEXIBLE MODE: Answer general questions helpfully."
    )

    state_instructions = _build_state_instructions(current_state_flow, current_state_step)

    system_prompt = (
        f"You are {agent_name}, the AI employee for {business_context.get('name', 'this business')}.\n\n"
        f"Business context:\n"
        f"- Type: {business_context.get('type', 'retail')}\n"
        f"- Delivery zones: {business_context.get('delivery_zones', 'Nairobi CBD and surrounding areas')}\n"
        f"- Working hours: {business_context.get('hours', 'Monday-Saturday 8am-6pm')}\n"
        f"- Payment: M-Pesa to {business_context.get('mpesa_number', 'our business number')}\n"
        f"- {strictness_instruction}\n"
        f"{knowledge_section}"
        f"{state_section}"
        f"\nIntent detected: {intent.value}\n\n"
        f"{state_instructions}\n\n"
        "IMPORTANT: Reply with JSON ONLY (no extra text):\n"
        '{"reply": "<your full reply to customer>", "next_step": "<next_step>", '
        '"extracted": {"product": null, "qty": null, "address": null, "service": null, "date": null, "time": null}}\n\n'
        "Available next_step values: idle, order.browsing, order.awaiting_quantity, "
        "order.awaiting_address, order.awaiting_confirmation, order.placed, "
        "booking.awaiting_service, booking.awaiting_date, booking.awaiting_time, booking.confirmed\n\n"
        "Instructions for reply:\n"
        "- Reply in the customer's language (Swahili or English)\n"
        "- Be warm, professional, solution-focused\n"
        "- For orders: guide through product → quantity → address → confirmation\n"
        "- For bookings: guide through service → date → time → confirmed\n"
        "- For payments: send M-Pesa number and amount\n"
        "- For complaints: empathize, apologize, offer resolution\n"
        "- Never make up products/prices not in context\n"
        "- Under 200 words per reply"
        + (f"\n\nAdditional instructions: {custom_prompt}" if custom_prompt else "")
    )

    messages = conversation_history[-10:] + [{"role": "user", "content": message}]

    try:
        start = time.time()
        response = await client.messages.create(
            model=settings.AI_MODEL_SMART,
            max_tokens=600,
            system=system_prompt,
            messages=messages,
        )
        elapsed = time.time() - start
        logger.info(
            f"Sonnet response in {elapsed:.2f}s | "
            f"tokens: {response.usage.input_tokens + response.usage.output_tokens}"
        )

        raw = response.content[0].text.strip()
        if "```" in raw:
            raw = re.sub(r"```(?:json)?", "", raw).strip()

        parsed = json.loads(raw)
        reply = parsed.get("reply", raw)  # Fall back to raw if JSON parse succeeded but no reply key
        next_step = parsed.get("next_step", "idle")
        extracted = parsed.get("extracted", {}) or {}
        return reply, next_step, extracted

    except json.JSONDecodeError:
        # Sonnet returned plain text — accept it, determine next_step heuristically
        # response is guaranteed to be in scope here (API succeeded, only JSON parse failed)
        raw_text = response.content[0].text.strip()  # type: ignore[possibly-undefined]
        next_step = _infer_next_step_from_reply(raw_text, intent, current_state_flow, current_state_step)
        return raw_text, next_step, {}
    except Exception as e:
        logger.error(f"Sonnet reply failed: {e}")
        return "Sorry, I'm having trouble right now. Please try again in a moment. 🙏", "idle", {}


# ── State instruction builder ─────────────────────────────────────────────────
def _build_state_instructions(flow: str, step: str) -> str:
    """Build context-appropriate instructions for the current state."""
    if flow == "idle" or not flow:
        return (
            "If the customer wants to ORDER something: set next_step='order.browsing' and "
            "extract the product name into extracted.product. Ask for quantity next.\n"
            "If the customer wants to BOOK something: set next_step='booking.awaiting_service' "
            "and ask which service they want."
        )
    elif flow == "order":
        if step == "browsing":
            return (
                "The customer is starting an order. Ask what quantity they want. "
                "Set next_step='order.awaiting_quantity'. "
                "Extract product name into extracted.product."
            )
        elif step == "awaiting_quantity":
            return (
                "The customer should be providing a quantity. Extract the quantity into extracted.qty. "
                "Once you have it, ask for their delivery address or pickup preference. "
                "Set next_step='order.awaiting_address'."
            )
        elif step == "awaiting_address":
            return (
                "The customer is providing their delivery address. Extract it into extracted.address. "
                "Confirm the full order details (product, qty, address, price if known) and ask customer to confirm. "
                "Set next_step='order.awaiting_confirmation'."
            )
        elif step == "awaiting_confirmation":
            return (
                "The customer is confirming their order. If they confirm (yes/ndio/ok/sawa), "
                "tell them the order is placed and you'll send M-Pesa payment details. "
                "Set next_step='order.placed'. "
                "If they want changes, adjust accordingly."
            )
        else:
            return "Continue guiding the customer through their order."
    elif flow == "booking":
        if step == "awaiting_service":
            return (
                "Ask which service the customer wants. Extract service name into extracted.service. "
                "Set next_step='booking.awaiting_date'."
            )
        elif step == "awaiting_date":
            return (
                "Ask for their preferred date. Extract date into extracted.date. "
                "Set next_step='booking.awaiting_time'."
            )
        elif step == "awaiting_time":
            return (
                "Ask for their preferred time slot. Extract time into extracted.time. "
                "Confirm the booking details and set next_step='booking.confirmed'."
            )
        else:
            return "Continue guiding the customer through their booking."
    return ""


def _infer_next_step_from_reply(reply: str, intent: Intent, flow: str, step: str) -> str:
    """Heuristically determine next_step when AI returns plain text."""
    reply_lower = reply.lower()

    if flow == "idle":
        if intent == Intent.ORDER:
            if any(w in reply_lower for w in ["quantity", "how many", "kiasi", "ngapi"]):
                return "order.awaiting_quantity"
            return "order.browsing"
        if intent == Intent.BOOKING:
            if any(w in reply_lower for w in ["service", "which service", "huduma"]):
                return "booking.awaiting_service"
    elif flow == "order":
        if step == "browsing" and any(w in reply_lower for w in ["quantity", "how many"]):
            return "order.awaiting_quantity"
        if step == "awaiting_quantity" and any(w in reply_lower for w in ["address", "deliver", "pickup"]):
            return "order.awaiting_address"
        if step == "awaiting_address" and any(w in reply_lower for w in ["confirm", "total", "summary"]):
            return "order.awaiting_confirmation"
        if step == "awaiting_confirmation" and any(w in reply_lower for w in ["placed", "confirmed", "mpesa"]):
            return "order.placed"
    elif flow == "booking":
        if step == "awaiting_service" and any(w in reply_lower for w in ["date", "when", "tarehe"]):
            return "booking.awaiting_date"
        if step == "awaiting_date" and any(w in reply_lower for w in ["time", "slot", "saa"]):
            return "booking.awaiting_time"
        if step == "awaiting_time" and any(w in reply_lower for w in ["confirmed", "booked", "appointment"]):
            return "booking.confirmed"

    return f"{flow}.{step}" if flow != "idle" else "idle"


# ── State transition engine ───────────────────────────────────────────────────
async def _advance_state(
    tenant_id: str,
    from_number: str,
    intent: Intent,
    current_state,
    next_step: str,
    extracted: dict,
):
    """
    Write the new conversation state to DB.
    If next_step is 'order.placed' → create Order record.
    If next_step is 'booking.confirmed' → create Booking record.
    Merges extracted data into existing state data.
    """
    if next_step == "idle" and (not current_state or current_state.flow == "idle"):
        return  # Nothing to do

    from app.core.database import AsyncSessionLocal
    from app.services.state_service import StateService

    async with AsyncSessionLocal() as db:
        svc = StateService(db)
        tid = uuid.UUID(tenant_id)

        # Merge extracted data with existing state data
        existing_data = {}
        if current_state:
            existing_data = current_state.get_data() if hasattr(current_state, 'get_data') else {}

        merged_data = {**existing_data}
        if extracted:
            for key, val in extracted.items():
                if val is not None:
                    merged_data[key] = val

        # Handle terminal states — create records and clear
        if next_step == "order.placed":
            await _create_order(db, tenant_id, from_number, merged_data)
            await svc.clear_state(tid, from_number)
            await db.commit()
            logger.info(f"Order created and state cleared for {from_number}")
            return

        if next_step == "booking.confirmed":
            await _create_booking(db, tenant_id, from_number, merged_data)
            await svc.clear_state(tid, from_number)
            await db.commit()
            logger.info(f"Booking created and state cleared for {from_number}")
            return

        if next_step == "idle":
            await svc.clear_state(tid, from_number)
            await db.commit()
            return

        # Parse flow and step from next_step (e.g., "order.awaiting_quantity" → flow="order", step="awaiting_quantity")
        if "." in next_step:
            flow, step = next_step.split(".", 1)
        else:
            flow = next_step
            step = ""

        await svc.set_state(tid, from_number, flow, step, merged_data)
        await db.commit()
        logger.info(f"State advanced to {next_step} for {from_number} | data: {merged_data}")


async def _create_order(db, tenant_id: str, from_number: str, state_data: dict):
    """Create an Order + OrderItem record from completed state data."""
    from app.models.order import Order, OrderItem, OrderStatus
    from app.models.customer import Customer
    from sqlalchemy import select

    tid = uuid.UUID(tenant_id)

    # Find customer
    cust_result = await db.execute(
        select(Customer)
        .where(Customer.tenant_id == tid)
        .where(Customer.phone == from_number)
    )
    customer = cust_result.scalar_one_or_none()

    # Generate order number
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    order_number = f"ORD-{suffix}"

    # Extract cart if available, otherwise build from state_data
    cart = state_data.get("cart", [])
    if not cart:
        product_name = state_data.get("product") or "Item"
        qty = _parse_qty(state_data.get("qty", 1))
        # Try to match product price from knowledge (best effort — use 0 as fallback)
        unit_price = state_data.get("unit_price", 0)
        cart = [{"name": product_name, "qty": qty, "price": unit_price}]

    total = sum(item.get("price", 0) * item.get("qty", 1) for item in cart)

    order = Order(
        tenant_id=tid,
        customer_id=customer.id if customer else None,
        order_number=order_number,
        status=OrderStatus.pending,
        subtotal=total,
        total=total,
        notes=f"Delivery: {state_data.get('address', 'TBD')} | Via WhatsApp",
        channel="whatsapp",
    )
    db.add(order)
    await db.flush()

    # Add order items
    for item in cart:
        unit_price = item.get("price", 0)
        qty = item.get("qty", 1)
        order_item = OrderItem(
            order_id=order.id,
            product_name=item.get("name", "Item"),
            quantity=qty,
            unit_price=unit_price,
            total_price=unit_price * qty,
        )
        db.add(order_item)

    logger.info(
        f"Created order {order_number} for {from_number} | "
        f"items: {len(cart)} | total: KSh {total:,}"
    )
    return order


async def _create_booking(db, tenant_id: str, from_number: str, state_data: dict):
    """Create a Booking record from completed state data."""
    from app.models.booking import Booking, BookingStatus
    from app.models.customer import Customer
    from sqlalchemy import select

    tid = uuid.UUID(tenant_id)

    cust_result = await db.execute(
        select(Customer)
        .where(Customer.tenant_id == tid)
        .where(Customer.phone == from_number)
    )
    customer = cust_result.scalar_one_or_none()

    service_name = state_data.get("service") or "Appointment"
    date_str = state_data.get("date") or ""
    time_str = state_data.get("time") or "10:00"

    # Parse scheduled_at from date + time strings
    scheduled_at = _parse_scheduled_at(date_str, time_str)

    booking = Booking(
        tenant_id=tid,
        customer_id=customer.id if customer else None,
        service_name=service_name,
        scheduled_at=scheduled_at,
        status=BookingStatus.pending,
        notes=f"Booked via WhatsApp | Date: {date_str} {time_str}",
    )
    db.add(booking)
    await db.flush()

    logger.info(
        f"Created booking for {from_number} | service: {service_name} | "
        f"scheduled: {scheduled_at}"
    )
    return booking


def _parse_qty(qty_val) -> int:
    """Parse quantity from various formats: '2kg', '2', 'two', etc."""
    if isinstance(qty_val, int):
        return qty_val
    if qty_val is None:
        return 1
    text = str(qty_val).lower().strip()
    # Strip common suffixes
    text = re.sub(r"(kg|pcs|pieces|units|servings|portions)", "", text).strip()
    try:
        return int(float(text))
    except (ValueError, TypeError):
        word_numbers = {
            "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
            "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        }
        return word_numbers.get(text, 1)


def _parse_scheduled_at(date_str: str, time_str: str) -> datetime:
    """Best-effort parse of booking datetime. Falls back to tomorrow 10am."""
    import pytz
    nairobi = pytz.timezone("Africa/Nairobi")
    now = datetime.now(nairobi)

    # Try common date formats
    for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%d %B %Y", "%d %b %Y", "%d-%m-%Y"]:
        try:
            date_part = datetime.strptime(date_str.strip(), fmt)
            break
        except (ValueError, AttributeError):
            date_part = None
    else:
        date_part = None

    if date_part is None:
        # Try relative: "tomorrow", "Monday", etc.
        date_part = _relative_date(date_str, now)

    # Parse time
    for fmt in ["%H:%M", "%I:%M %p", "%I%p", "%H%M"]:
        try:
            time_part = datetime.strptime(time_str.strip(), fmt)
            break
        except (ValueError, AttributeError):
            time_part = None
    else:
        time_part = None

    if date_part and time_part:
        scheduled = date_part.replace(
            hour=time_part.hour, minute=time_part.minute, second=0, microsecond=0
        )
    elif date_part:
        scheduled = date_part.replace(hour=10, minute=0, second=0, microsecond=0)
    else:
        # Default: tomorrow 10am
        from datetime import timedelta
        scheduled = now + timedelta(days=1)
        scheduled = scheduled.replace(hour=10, minute=0, second=0, microsecond=0)

    # Make timezone-aware if naive
    if scheduled.tzinfo is None:
        scheduled = nairobi.localize(scheduled)

    return scheduled


def _relative_date(date_str: str, now: datetime) -> Optional[datetime]:
    """Parse relative date strings like 'tomorrow', 'Monday', 'next Friday'."""
    from datetime import timedelta
    s = (date_str or "").lower().strip()
    if "tomorrow" in s or "kesho" in s:
        return now + timedelta(days=1)
    if "today" in s or "leo" in s:
        return now
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for i, name in enumerate(day_names):
        if name in s:
            days_ahead = (i - now.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7  # 'next' occurrence
            return now + timedelta(days=days_ahead)
    return None


# ── Main entry point ──────────────────────────────────────────────────────────
async def process_whatsapp_message(
    phone_number_id: str,
    from_number: str,
    msg: dict,
    msg_type: str,
    msg_id: str,
    contact_name: str,
):
    """
    Main AI router — called in background task from webhook.

    Flow:
    1. Extract message text
    2. Load tenant + knowledge + conversation state
    3. Stage 1: Deterministic classify
    4. Stage 2: Haiku if stage 1 fails
    5. Stage 3: Sonnet if complex intent
    6. Business hours check — add expectation message if closed
    7. Handle handoff intent
    8. Advance state machine → write state transitions / create Order|Booking
    9. Send WhatsApp reply
    10. Log to DB
    """
    # Extract text from message
    text = _extract_text(msg, msg_type)
    if not text:
        logger.debug(f"No text in message type {msg_type}, skipping")
        return

    logger.info(f"Processing message from {from_number}: '{text[:80]}'")

    # Load tenant config from DB
    tenant = await _get_tenant_by_phone_id(phone_number_id)
    if not tenant:
        logger.warning(f"No tenant found for phone_number_id: {phone_number_id}")
        return

    # Check if agent is enabled
    from app.services.agent_toggle_service import agent_toggle
    if not await agent_toggle.is_enabled(tenant["id"]):
        logger.info(f"Agent is OFF for tenant {tenant['id']} — not processing message")
        return

    conversation_id = await _reserve_inbound_message(
        tenant_id=tenant["id"],
        from_number=from_number,
        contact_name=contact_name,
        inbound=text,
        wa_message_id=msg_id,
    )
    if conversation_id is None:
        logger.info(f"Duplicate WhatsApp message skipped before AI processing: {msg_id}")
        return

    business_context = tenant.get("business_context", {})

    # Load conversation history
    conversation_history = await _load_conversation_history(from_number, tenant["id"])

    # Load conversation state
    state = await _get_conversation_state(from_number, tenant["id"])
    from app.services.state_service import StateService
    state_svc = StateService(None)  # stateless formatting only
    state_context = state_svc.format_state_context(state)
    business_context["state_context"] = state_context

    current_flow = state.flow if state else "idle"
    current_step = state.step if state else ""

    # ── Stage 1: Deterministic ────────────────────────────────────────────────
    intent = classify_deterministic(text)
    reply = None
    next_step = "idle"
    extracted: dict = {}

    if intent == Intent.GREETING and current_flow == "idle":
        agent_name = tenant.get("ai_agent_name", "Nura")
        name = business_context.get("name", "us")
        reply = (
            f"Karibu! 👋 I'm {agent_name} from {name}. How can I help you today?\n\n"
            f"*Naweza kukusaidia na nini?* 😊"
        )
        next_step = "idle"

    elif intent == Intent.HUMAN_NEEDED:
        reply = (
            "Of course! I'll connect you with our team right away. "
            "A human agent will take over this conversation shortly. 📞\n\n"
            "Please hold on — you'll be attended to soon."
        )
        next_step = "idle"

    # ── Stage 2+3: AI ─────────────────────────────────────────────────────────
    if reply is None:
        # Always call Haiku if we don't have a reply yet (even if intent is known from Stage 1)
        if intent is None or reply is None:
            h_intent, h_reply, h_next_step, h_extracted = await classify_with_haiku(
                text, business_context, conversation_history,
                current_state_flow=current_flow,
                current_state_step=current_step,
            )
            if intent is None:
                intent = h_intent
            reply = h_reply
            next_step = h_next_step
            extracted = h_extracted

        # Complex intents OR active order/booking flow → escalate to Sonnet for richer handling
        needs_sonnet = (
            intent in (Intent.ORDER, Intent.BOOKING, Intent.COMPLAINT, Intent.UNKNOWN)
            or current_flow in ("order", "booking")
            or not reply
        )
        if needs_sonnet:
            reply, next_step, extracted = await reply_with_sonnet(
                text, intent, business_context, conversation_history,
                current_state_flow=current_flow,
                current_state_step=current_step,
            )

    # ── Business hours check ──────────────────────────────────────────────────
    if intent in (Intent.ORDER, Intent.BOOKING) and not is_business_open(business_context):
        flow_word = "order" if intent == Intent.ORDER else "appointment request"
        review_word = "orders" if intent == Intent.ORDER else "bookings"
        hours_note = (
            f"\n\n⏰ *Note:* Your {flow_word} has been noted! Our team reviews {review_word} "
            "during business hours (8am-6pm Mon-Sat). We'll confirm by the next business morning."
        )
        reply = (reply or "") + hours_note

    # ── Handoff handling ──────────────────────────────────────────────────────
    if intent == Intent.HUMAN_NEEDED:
        await _trigger_handoff(from_number, tenant["id"], text, conversation_history)
        next_step = "idle"  # Clear state on handoff

    # ── Advance state machine ─────────────────────────────────────────────────
    # This writes state transitions to DB and creates Order/Booking records
    await _advance_state(
        tenant_id=tenant["id"],
        from_number=from_number,
        intent=intent,
        current_state=state,
        next_step=next_step,
        extracted=extracted,
    )

    # ── Send reply ────────────────────────────────────────────────────────────
    if reply:
        wa = get_whatsapp_client(
            phone_number_id=phone_number_id,
            access_token=tenant.get("wa_access_token", ""),
        )
        await wa.mark_read(msg_id)
        await wa.send_text(to=from_number, body=reply)

        # Log conversation
        await _log_message(
            tenant_id=tenant["id"],
            from_number=from_number,
            contact_name=contact_name,
            inbound=text,
            outbound=reply,
            intent=intent.value if intent else "unknown",
            wa_message_id=msg_id,
            conversation_id=conversation_id,
            inbound_already_logged=True,
        )


# ── Real DB implementations ────────────────────────────────────────────────────
async def _get_tenant_by_phone_id(phone_number_id: str) -> Optional[dict]:
    """Load tenant from DB by WhatsApp phone_number_id."""
    from app.core.database import AsyncSessionLocal
    from app.models.tenant import Tenant
    from app.services.knowledge_service import KnowledgeService
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Tenant).where(Tenant.wa_phone_number_id == phone_number_id)
        )
        tenant = result.scalar_one_or_none()
        if not tenant:
            return None

        # Load knowledge context
        knowledge_svc = KnowledgeService(db)
        knowledge = await knowledge_svc.build_ai_context(tenant.id)

        return {
            "id": str(tenant.id),
            "wa_access_token": tenant.wa_access_token or "",
            "ai_agent_name": getattr(tenant, "ai_agent_name", None) or "Nura",
            "ai_strictness": getattr(tenant, "ai_strictness", "flexible"),
            "business_context": {
                "name": tenant.business_name,
                "type": getattr(tenant, "business_type", None) or "retail",
                "mpesa_number": tenant.mpesa_shortcode or "",
                "ai_tone": tenant.ai_tone or "friendly",
                "ai_language": tenant.ai_language or "auto",
                "ai_custom_prompt": tenant.ai_custom_instructions or "",
                "ai_strictness": getattr(tenant, "ai_strictness", "flexible"),
                "agent_name": getattr(tenant, "ai_agent_name", None) or "Nura",
                "knowledge": knowledge,
            },
        }


async def _load_conversation_history(from_number: str, tenant_id: str) -> list[dict]:
    """Load last 20 messages for this conversation from DB."""
    from app.core.database import AsyncSessionLocal
    from app.models.message import Conversation, Message
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        # Find most recent conversation
        conv_result = await db.execute(
            select(Conversation)
            .where(Conversation.tenant_id == uuid.UUID(tenant_id))
            .where(Conversation.customer_phone == from_number)
            .order_by(Conversation.created_at.desc())
            .limit(1)
        )
        conv = conv_result.scalar_one_or_none()
        if not conv:
            return []

        # Load last 20 messages
        msg_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(20)
        )
        messages = list(reversed(msg_result.scalars().all()))

        history = []
        for msg in messages:
            role = "user" if msg.direction == "inbound" else "assistant"
            history.append({"role": role, "content": msg.content})
        return history


async def _get_conversation_state(from_number: str, tenant_id: str):
    """Load conversation state from DB."""
    from app.core.database import AsyncSessionLocal
    from app.models.conversation_state import ConversationState
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ConversationState)
            .where(ConversationState.tenant_id == uuid.UUID(tenant_id))
            .where(ConversationState.customer_phone == from_number)
        )
        state = result.scalar_one_or_none()
        if state and state.flow == "idle":
            return None
        return state


async def _reserve_inbound_message(
    tenant_id: str,
    from_number: str,
    contact_name: str,
    inbound: str,
    wa_message_id: str | None,
) -> str | None:
    """
    Persist the inbound WhatsApp message before AI work starts.
    Returns the conversation ID, or None when the message is a duplicate.
    """
    from sqlalchemy import select
    from sqlalchemy.exc import IntegrityError
    from app.core.database import AsyncSessionLocal
    from app.models.customer import Customer
    from app.models.message import Conversation, ConversationStatus, Message, MessageDirection

    async with AsyncSessionLocal() as db:
        tid = uuid.UUID(tenant_id)

        cust_result = await db.execute(
            select(Customer)
            .where(Customer.tenant_id == tid)
            .where(Customer.phone == from_number)
        )
        customer = cust_result.scalar_one_or_none()
        if not customer:
            customer = Customer(
                tenant_id=tid,
                phone=from_number,
                name=contact_name or from_number,
            )
            db.add(customer)
            await db.flush()

        conv_result = await db.execute(
            select(Conversation)
            .where(Conversation.tenant_id == tid)
            .where(Conversation.customer_phone == from_number)
            .where(Conversation.status != ConversationStatus.resolved)
            .order_by(Conversation.created_at.desc())
            .limit(1)
        )
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            conversation = Conversation(
                tenant_id=tid,
                customer_id=customer.id,
                customer_phone=from_number,
                status=ConversationStatus.bot,
            )
            db.add(conversation)
            await db.flush()

        inbound_msg = Message(
            tenant_id=tid,
            conversation_id=conversation.id,
            wa_message_id=wa_message_id,
            direction=MessageDirection.inbound,
            content=inbound,
            ai_stage=None,
        )
        db.add(inbound_msg)

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            return None

        return str(conversation.id)


async def _log_message(
    tenant_id: str,
    from_number: str,
    contact_name: str,
    inbound: str,
    outbound: str,
    intent: str,
    ai_stage: str = "haiku",
    wa_message_id: str | None = None,
    conversation_id: str | None = None,
    inbound_already_logged: bool = False,
):
    """Persist conversation + messages to DB."""
    from app.core.database import AsyncSessionLocal
    from app.models.message import Conversation, Message, ConversationStatus, MessageDirection
    from app.models.customer import Customer
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        tid = uuid.UUID(tenant_id)

        # Upsert customer
        cust_result = await db.execute(
            select(Customer)
            .where(Customer.tenant_id == tid)
            .where(Customer.phone == from_number)
        )
        customer = cust_result.scalar_one_or_none()
        if not customer:
            customer = Customer(
                tenant_id=tid,
                phone=from_number,
                name=contact_name or from_number,
            )
            db.add(customer)
            await db.flush()

        conversation = None
        if conversation_id:
            conv_result = await db.execute(
                select(Conversation)
                .where(Conversation.tenant_id == tid)
                .where(Conversation.id == uuid.UUID(conversation_id))
                .limit(1)
            )
            conversation = conv_result.scalar_one_or_none()

        # Find open conversation or create new
        if not conversation:
            conv_result = await db.execute(
                select(Conversation)
                .where(Conversation.tenant_id == tid)
                .where(Conversation.customer_phone == from_number)
                .where(Conversation.status != ConversationStatus.resolved)
                .order_by(Conversation.created_at.desc())
                .limit(1)
            )
            conversation = conv_result.scalar_one_or_none()
        if not conversation:
            conversation = Conversation(
                tenant_id=tid,
                customer_id=customer.id,
                customer_phone=from_number,
                status=ConversationStatus.bot,
            )
            db.add(conversation)
            await db.flush()

        if not inbound_already_logged:
            inbound_msg = Message(
                tenant_id=tid,
                conversation_id=conversation.id,
                wa_message_id=wa_message_id,
                direction=MessageDirection.inbound,
                content=inbound,
                ai_stage=None,
            )
            db.add(inbound_msg)

        # Save outbound message
        outbound_msg = Message(
            tenant_id=tid,
            conversation_id=conversation.id,
            direction=MessageDirection.outbound,
            content=outbound,
            ai_stage=ai_stage,
        )
        db.add(outbound_msg)

        await db.commit()
        logger.info(
            f"Logged conversation {conversation.id} | {from_number} | intent={intent}"
        )


async def _trigger_handoff(
    from_number: str, tenant_id: str, message: str, history: list
):
    """Mark conversation as needing human, notify tenant owner."""
    from app.core.database import AsyncSessionLocal
    from app.models.message import Conversation, ConversationStatus
    from sqlalchemy import select, update

    async with AsyncSessionLocal() as db:
        tid = uuid.UUID(tenant_id)
        await db.execute(
            update(Conversation)
            .where(Conversation.tenant_id == tid)
            .where(Conversation.customer_phone == from_number)
            .where(Conversation.status == ConversationStatus.bot)
            .values(status=ConversationStatus.human)
        )
        await db.commit()

    # NOTE: WhatsApp template notification to tenant owner requires
    # Meta pre-approval of template messages. Logged here as escalation signal.
    logger.info(f"HANDOFF triggered for {from_number} in tenant {tenant_id}")


def _extract_text(msg: dict, msg_type: str) -> Optional[str]:
    """Extract the text content from a WhatsApp message object."""
    if msg_type == "text":
        return msg.get("text", {}).get("body", "").strip()
    elif msg_type == "button":
        return msg.get("button", {}).get("text", "").strip()
    elif msg_type == "interactive":
        interactive = msg.get("interactive", {})
        itype = interactive.get("type")
        if itype == "button_reply":
            return interactive.get("button_reply", {}).get("title", "")
        elif itype == "list_reply":
            return interactive.get("list_reply", {}).get("title", "")
    elif msg_type == "audio":
        # Audio transcription via Whisper — planned for Sprint 3
        return None
    elif msg_type == "image":
        return msg.get("image", {}).get("caption", "") or None
    return None
