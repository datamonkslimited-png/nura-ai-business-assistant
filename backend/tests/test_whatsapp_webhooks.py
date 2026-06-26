import hashlib
import hmac
import json
from pathlib import Path
import sys

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ai import router as ai_router
from app.api.v1.endpoints import webhooks


SECRET = "test-meta-secret"
VERIFY_TOKEN = "test-verify-token"


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(webhooks.settings, "META_APP_SECRET", SECRET)
    monkeypatch.setattr(webhooks.settings, "META_WHATSAPP_VERIFY_TOKEN", VERIFY_TOKEN)

    app = FastAPI()
    app.include_router(webhooks.router, prefix="/webhooks")
    return TestClient(app)


def sign_body(body: bytes, secret: str = SECRET) -> str:
    digest = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def post_signed(client: TestClient, payload):
    body = json.dumps(payload).encode()
    return client.post(
        "/webhooks/whatsapp",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": sign_body(body),
        },
    )


def text_payload(
    *,
    phone_number_id: str = "phone-123",
    from_number: str = "254712345678",
    msg_id: str = "wamid.test-message-1",
    text: str = "Hi, I want a birthday cake",
    contact_name: str = "Jane Customer",
) -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "waba-1",
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "metadata": {
                                "phone_number_id": phone_number_id,
                                "display_phone_number": "254700000000",
                            },
                            "contacts": [
                                {
                                    "wa_id": from_number,
                                    "profile": {"name": contact_name},
                                }
                            ],
                            "messages": [
                                {
                                    "from": from_number,
                                    "id": msg_id,
                                    "timestamp": "1710000000",
                                    "type": "text",
                                    "text": {"body": text},
                                }
                            ],
                        },
                    }
                ],
            }
        ],
    }


def status_payload() -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "waba-1",
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "metadata": {"phone_number_id": "phone-123"},
                            "statuses": [
                                {
                                    "id": "wamid.status-1",
                                    "status": "delivered",
                                    "timestamp": "1710000001",
                                    "recipient_id": "254712345678",
                                }
                            ],
                        },
                    }
                ],
            }
        ],
    }


def test_get_webhook_verification_returns_challenge(client):
    response = client.get(
        "/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": VERIFY_TOKEN,
            "hub.challenge": "challenge-123",
        },
    )

    assert response.status_code == 200
    assert response.text == "challenge-123"


def test_valid_hmac_post_accepts_payload(client, monkeypatch):
    calls = []

    async def fake_process_whatsapp_message(**kwargs):
        calls.append(kwargs)

    async def fake_is_duplicate_message(message_id: str) -> bool:
        return False

    monkeypatch.setattr(webhooks, "process_whatsapp_message", fake_process_whatsapp_message)
    monkeypatch.setattr(webhooks, "_is_duplicate_message", fake_is_duplicate_message)

    response = post_signed(client, text_payload(msg_id="wamid.valid-hmac"))

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert len(calls) == 1


def test_invalid_hmac_post_is_rejected(client, monkeypatch):
    calls = []

    async def fake_process_whatsapp_message(**kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(webhooks, "process_whatsapp_message", fake_process_whatsapp_message)
    body = json.dumps(text_payload()).encode()

    response = client.post(
        "/webhooks/whatsapp",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": "sha256=bad",
        },
    )

    assert response.status_code == 403
    assert calls == []


def test_malformed_json_returns_400(client, monkeypatch):
    calls = []

    async def fake_process_whatsapp_message(**kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(webhooks, "process_whatsapp_message", fake_process_whatsapp_message)
    body = b"{not-json"

    response = client.post(
        "/webhooks/whatsapp",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": sign_body(body),
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid JSON payload"
    assert calls == []


def test_status_only_webhook_does_not_schedule_ai_processing(client, monkeypatch):
    calls = []

    async def fake_process_whatsapp_message(**kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(webhooks, "process_whatsapp_message", fake_process_whatsapp_message)

    response = post_signed(client, status_payload())

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert calls == []


def test_normal_customer_text_message_schedules_router_with_expected_fields(client, monkeypatch):
    calls = []

    async def fake_process_whatsapp_message(**kwargs):
        calls.append(kwargs)

    async def fake_is_duplicate_message(message_id: str) -> bool:
        return False

    monkeypatch.setattr(webhooks, "process_whatsapp_message", fake_process_whatsapp_message)
    monkeypatch.setattr(webhooks, "_is_duplicate_message", fake_is_duplicate_message)

    response = post_signed(
        client,
        text_payload(
            phone_number_id="phone-normal",
            from_number="254711111111",
            msg_id="wamid.normal-text",
            text="How much is chocolate cake?",
            contact_name="Grace Wanjiku",
        ),
    )

    assert response.status_code == 200
    assert len(calls) == 1
    call = calls[0]
    assert call["phone_number_id"] == "phone-normal"
    assert call["from_number"] == "254711111111"
    assert call["msg_type"] == "text"
    assert call["msg_id"] == "wamid.normal-text"
    assert call["contact_name"] == "Grace Wanjiku"
    assert call["msg"]["text"]["body"] == "How much is chocolate cake?"


def test_duplicate_whatsapp_message_delivery_is_ignored(client, monkeypatch):
    calls = []
    seen_message_ids = set()

    async def fake_process_whatsapp_message(**kwargs):
        calls.append(kwargs)
        seen_message_ids.add(kwargs["msg_id"])

    async def fake_is_duplicate_message(message_id: str) -> bool:
        return message_id in seen_message_ids

    monkeypatch.setattr(webhooks, "process_whatsapp_message", fake_process_whatsapp_message)
    monkeypatch.setattr(webhooks, "_is_duplicate_message", fake_is_duplicate_message)

    payload = text_payload(msg_id="wamid.duplicate")
    first = post_signed(client, payload)
    second = post_signed(client, payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert len(calls) == 1
    assert calls[0]["msg_id"] == "wamid.duplicate"


@pytest.mark.asyncio
async def test_unknown_phone_number_id_stops_before_sending_or_logging(monkeypatch):
    calls = {"tenant_lookup": 0, "send": 0, "log": 0}

    async def fake_get_tenant_by_phone_id(phone_number_id: str):
        calls["tenant_lookup"] += 1
        return None

    def fake_get_whatsapp_client(*args, **kwargs):
        calls["send"] += 1
        raise AssertionError("WhatsApp client should not be created for unknown phone_number_id")

    async def fake_log_message(*args, **kwargs):
        calls["log"] += 1

    monkeypatch.setattr(ai_router, "_get_tenant_by_phone_id", fake_get_tenant_by_phone_id)
    monkeypatch.setattr(ai_router, "get_whatsapp_client", fake_get_whatsapp_client)
    monkeypatch.setattr(ai_router, "_log_message", fake_log_message)

    await ai_router.process_whatsapp_message(
        phone_number_id="unknown-phone-number-id",
        from_number="254722222222",
        msg={
            "from": "254722222222",
            "id": "wamid.unknown-phone",
            "type": "text",
            "text": {"body": "Hi"},
        },
        msg_type="text",
        msg_id="wamid.unknown-phone",
        contact_name="Unknown Customer",
    )

    assert calls == {"tenant_lookup": 1, "send": 0, "log": 0}
