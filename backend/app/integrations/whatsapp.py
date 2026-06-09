"""
WhatsApp Cloud API integration service.
Handles sending messages, buttons, templates, and media.
"""
import httpx
from loguru import logger
from typing import Optional

from app.core.config import settings


class WhatsAppClient:
    """
    Wrapper around Meta WhatsApp Cloud API v20.
    Each tenant has their own phone_number_id and access_token.
    """

    def __init__(self, phone_number_id: str, access_token: str):
        self.phone_number_id = phone_number_id
        self.access_token = access_token
        self.base_url = f"{settings.META_WHATSAPP_API_URL}/{phone_number_id}/messages"

    @property
    def _headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    async def send_text(self, to: str, body: str, preview_url: bool = False) -> dict:
        """Send a plain text message."""
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"preview_url": preview_url, "body": body},
        }
        return await self._post(payload)

    async def send_buttons(self, to: str, body: str, buttons: list[dict]) -> dict:
        """
        Send interactive button message.
        buttons: [{"id": "btn_order", "title": "Place Order"}]
        Max 3 buttons.
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": body},
                "action": {
                    "buttons": [
                        {"type": "reply", "reply": {"id": b["id"], "title": b["title"][:20]}}
                        for b in buttons[:3]
                    ]
                },
            },
        }
        return await self._post(payload)

    async def send_list(self, to: str, header: str, body: str, button_text: str, sections: list[dict]) -> dict:
        """
        Send interactive list message.
        sections: [{"title": "Products", "rows": [{"id": "p1", "title": "Cake", "description": "KSh 600"}]}]
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "header": {"type": "text", "text": header},
                "body": {"text": body},
                "action": {"button": button_text, "sections": sections},
            },
        }
        return await self._post(payload)

    async def send_template(self, to: str, template_name: str, language_code: str = "en_US", components: Optional[list] = None) -> dict:
        """Send a pre-approved template message (required for first-contact or >24h window)."""
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
                "components": components or [],
            },
        }
        return await self._post(payload)

    async def send_image(self, to: str, image_url: str, caption: str = "") -> dict:
        """Send an image with optional caption."""
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "image",
            "image": {"link": image_url, "caption": caption},
        }
        return await self._post(payload)

    async def mark_read(self, message_id: str) -> dict:
        """Mark a message as read (shows blue ticks)."""
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id,
        }
        return await self._post(payload)

    async def _post(self, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(self.base_url, json=payload, headers=self._headers)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"WhatsApp API error {e.response.status_code}: {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"WhatsApp send failed: {e}")
                raise


def get_whatsapp_client(phone_number_id: str, access_token: str) -> WhatsAppClient:
    """Factory — each tenant passes their own credentials."""
    return WhatsAppClient(phone_number_id, access_token)
