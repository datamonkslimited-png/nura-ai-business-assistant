"""
WhatsApp Cloud API webhook — verification + incoming message handling.
"""
import hashlib
import hmac
import json
from json import JSONDecodeError
from fastapi import APIRouter, Request, Response, HTTPException, Depends, BackgroundTasks
from loguru import logger

from app.core.config import settings
from app.ai.router import process_whatsapp_message

router = APIRouter()


# ── GET: Meta webhook verification ────────────────────────────────────────────
@router.get("/whatsapp")
async def verify_whatsapp_webhook(request: Request):
    """
    Meta sends a GET with hub.challenge during webhook setup.
    We must return the challenge if the verify_token matches.
    """
    params = dict(request.query_params)
    mode      = params.get("hub.mode")
    token     = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == settings.META_WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified")
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Webhook verification failed")


# ── POST: Incoming messages ────────────────────────────────────────────────────
@router.post("/whatsapp")
async def receive_whatsapp_message(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Receives all incoming WhatsApp events:
    - text messages
    - button replies
    - media messages
    - status updates (delivered, read, failed)
    """
    # 1. Verify signature from Meta
    raw_body = await request.body()
    _verify_meta_signature(request, raw_body)

    try:
        payload = json.loads(raw_body)
    except JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    logger.debug(f"WhatsApp payload: {payload}")

    # 2. Extract the entry list
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            # Status updates (delivered/read/failed) — log and ignore
            if "statuses" in value:
                for status in value["statuses"]:
                    logger.info(f"Message status update: {status.get('status')} for {status.get('id')}")
                continue

            # Incoming messages
            messages_list = value.get("messages", [])
            metadata      = value.get("metadata", {})
            contacts      = value.get("contacts", [])
            phone_number_id = metadata.get("phone_number_id", "")
            tenant_id = await _get_tenant_id_by_phone_number_id(phone_number_id)
            if not tenant_id:
                logger.warning(f"No tenant found for WhatsApp phone_number_id: {phone_number_id}")
                continue

            for msg in messages_list:
                from_number = msg.get("from")
                msg_type    = msg.get("type")  # text | image | audio | button | interactive
                msg_id      = msg.get("id")

                contact_name = contacts[0]["profile"]["name"] if contacts else "Unknown"

                if msg_id and await _is_duplicate_message(tenant_id, msg_id):
                    logger.info(f"Duplicate WhatsApp message ignored: {msg_id}")
                    continue

                # Process in background to return 200 quickly (Meta requires fast response)
                background_tasks.add_task(
                    process_whatsapp_message,
                    phone_number_id=phone_number_id,
                    from_number=from_number,
                    msg=msg,
                    msg_type=msg_type,
                    msg_id=msg_id,
                    contact_name=contact_name,
                )

    return {"status": "ok"}


def _verify_meta_signature(request: Request, raw_body: bytes):
    """
    Verify X-Hub-Signature-256 header from Meta.
    Skip in development/testing.
    """
    if not settings.META_APP_SECRET:
        return  # Skip in dev

    signature = request.headers.get("X-Hub-Signature-256", "")
    if not signature.startswith("sha256="):
        raise HTTPException(status_code=403, detail="Missing signature")

    expected = hmac.new(
        settings.META_APP_SECRET.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(f"sha256={expected}", signature):
        raise HTTPException(status_code=403, detail="Invalid signature")


async def _get_tenant_id_by_phone_number_id(phone_number_id: str) -> str | None:
    """Return tenant ID for a WhatsApp phone_number_id, or None when unknown."""
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.tenant import Tenant

    if not phone_number_id:
        return None

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Tenant.id).where(Tenant.wa_phone_number_id == phone_number_id).limit(1)
        )
        tenant_id = result.scalar_one_or_none()
        return str(tenant_id) if tenant_id else None


async def _is_duplicate_message(tenant_id: str, message_id: str) -> bool:
    """Return True when a tenant has already persisted this WhatsApp message ID."""
    import uuid
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.message import Message, MessageDirection

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Message.id)
            .where(Message.tenant_id == uuid.UUID(tenant_id))
            .where(Message.wa_message_id == message_id)
            .where(Message.direction == MessageDirection.inbound)
            .limit(1)
        )
        return result.scalar_one_or_none() is not None
