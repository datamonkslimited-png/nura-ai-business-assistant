"""
M-Pesa Daraja API integration.
Supports STK Push, callback handling, and payment validation.
"""
import base64
import httpx
from datetime import datetime
from loguru import logger
from typing import Optional

from app.core.config import settings


class MPesaClient:
    """
    Safaricom Daraja API client.
    Works with both sandbox and production based on MPESA_BASE_URL.
    """

    def __init__(
        self,
        consumer_key: str,
        consumer_secret: str,
        shortcode: str,
        passkey: str,
        callback_url: str,
    ):
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.shortcode = shortcode
        self.passkey = passkey
        self.callback_url = callback_url
        self.base_url = settings.MPESA_BASE_URL
        self._token: Optional[str] = None

    # ── OAuth ────────────────────────────────────────────────────────────────
    async def get_access_token(self) -> str:
        """Fetch OAuth2 access token from Safaricom."""
        creds = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {creds}"},
            )
            resp.raise_for_status()
            self._token = resp.json()["access_token"]
            return self._token

    # ── STK Push ─────────────────────────────────────────────────────────────
    async def stk_push(
        self,
        phone_number: str,
        amount: int,
        account_reference: str,
        transaction_desc: str = "NURA Payment",
    ) -> dict:
        """
        Initiate Lipa Na M-Pesa Online (STK Push).

        Args:
            phone_number: Customer number in format 254XXXXXXXXX
            amount: Amount in KSh (whole number)
            account_reference: Order ID or reference shown to customer
            transaction_desc: Short description (max 13 chars shown on phone)

        Returns:
            Daraja API response with CheckoutRequestID for tracking
        """
        token = await self.get_access_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(
            f"{self.shortcode}{self.passkey}{timestamp}".encode()
        ).decode()

        # Normalize phone: 07xx → 2547xx, +2547xx → 2547xx
        phone = _normalize_phone(phone_number)

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": self.shortcode,
            "PhoneNumber": phone,
            "CallBackURL": self.callback_url,
            "AccountReference": account_reference[:12],
            "TransactionDesc": transaction_desc[:13],
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()
            result = resp.json()
            logger.info(f"STK Push sent: {result.get('CheckoutRequestID')} | Phone: {phone} | Amount: {amount}")
            return result

    # ── STK Query ─────────────────────────────────────────────────────────────
    async def stk_query(self, checkout_request_id: str) -> dict:
        """Check the status of an STK push transaction."""
        token = await self.get_access_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(
            f"{self.shortcode}{self.passkey}{timestamp}".encode()
        ).decode()

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.base_url}/mpesa/stkpushquery/v1/query",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()
            return resp.json()


# ── Callback Handler ──────────────────────────────────────────────────────────
def parse_stk_callback(callback_body: dict) -> dict:
    """
    Parse the STK Push callback from Safaricom.

    Returns a normalized dict:
    {
        "success": bool,
        "checkout_request_id": str,
        "amount": float | None,
        "mpesa_receipt": str | None,
        "phone_number": str | None,
        "result_code": int,
        "result_desc": str,
    }
    """
    stkCallback = callback_body.get("Body", {}).get("stkCallback", {})
    result_code = stkCallback.get("ResultCode", -1)
    result_desc = stkCallback.get("ResultDesc", "Unknown")
    checkout_id = stkCallback.get("CheckoutRequestID", "")

    if result_code != 0:
        return {
            "success": False,
            "checkout_request_id": checkout_id,
            "amount": None,
            "mpesa_receipt": None,
            "phone_number": None,
            "result_code": result_code,
            "result_desc": result_desc,
        }

    # Extract metadata items
    metadata_items = stkCallback.get("CallbackMetadata", {}).get("Item", [])
    meta = {item["Name"]: item.get("Value") for item in metadata_items}

    return {
        "success": True,
        "checkout_request_id": checkout_id,
        "amount": meta.get("Amount"),
        "mpesa_receipt": meta.get("MpesaReceiptNumber"),
        "phone_number": str(meta.get("PhoneNumber", "")),
        "transaction_date": meta.get("TransactionDate"),
        "result_code": result_code,
        "result_desc": result_desc,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────
def _normalize_phone(phone: str) -> str:
    """Normalize Kenyan phone to 2547XXXXXXXX format."""
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        phone = phone[1:]
    if phone.startswith("07") or phone.startswith("01"):
        phone = "254" + phone[1:]
    if not phone.startswith("254"):
        phone = "254" + phone
    return phone


def format_passive_payment_details(
    shortcode: str,
    account_reference: str,
    amount: int,
    business_name: str = "the business",
) -> str:
    """
    Format a human-readable M-Pesa payment instruction for passive mode.
    Used when owner has NOT confirmed yet (per spec: STK only after confirmation).
    """
    return (
        f"💳 *M-Pesa Payment Details*\n\n"
        f"Pay *KSh {amount:,}* to:\n"
        f"📱 Paybill: *{shortcode}*\n"
        f"Account: *{account_reference}*\n\n"
        f"_Please send your M-Pesa confirmation SMS after payment so we can verify._\n\n"
        f"✅ Once {business_name} confirms your order, we'll also send you an M-Pesa prompt directly."
    )


def extract_mpesa_confirmation(text: str) -> Optional[dict]:
    """
    Extract M-Pesa confirmation code from customer message.
    Matches patterns like: RBA0X1Y2Z3 confirmed. Ksh500 sent to...
    Returns {"code": "RBA0X1Y2Z3", "amount": 500} or None.
    """
    import re
    pattern = r'\b([A-Z0-9]{10})\b.*?[Kk][Ss]?[Hh]?\s*(\d+(?:,\d+)?)'
    match = re.search(pattern, text)
    if match:
        code = match.group(1)
        amount_str = match.group(2).replace(",", "")
        return {"code": code, "amount": int(amount_str)}
    return None


def get_mpesa_client(
    consumer_key: str = None,
    consumer_secret: str = None,
    shortcode: str = None,
    passkey: str = None,
    callback_url: str = None,
) -> MPesaClient:
    """Factory — use tenant creds if provided, else fall back to settings defaults."""
    return MPesaClient(
        consumer_key=consumer_key or settings.MPESA_CONSUMER_KEY,
        consumer_secret=consumer_secret or settings.MPESA_CONSUMER_SECRET,
        shortcode=shortcode or settings.MPESA_SHORTCODE,
        passkey=passkey or settings.MPESA_PASSKEY,
        callback_url=callback_url or settings.MPESA_CALLBACK_URL,
    )
