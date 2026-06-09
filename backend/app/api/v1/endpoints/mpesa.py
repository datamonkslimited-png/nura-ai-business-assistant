from fastapi import APIRouter, Request, HTTPException
from loguru import logger
from app.integrations.mpesa import parse_stk_callback, get_mpesa_client

router = APIRouter()

@router.post("/stk-push")
async def initiate_stk_push(phone: str, amount: int, reference: str):
    """Trigger M-Pesa STK Push for a customer."""
    client = get_mpesa_client()
    result = await client.stk_push(phone, amount, reference)
    return result

@router.post("/webhooks/mpesa/callback")
async def mpesa_callback(request: Request):
    """Receive M-Pesa payment confirmation from Safaricom."""
    body = await request.json()
    logger.info(f"M-Pesa callback: {body}")
    result = parse_stk_callback(body)
    
    if result["success"]:
        logger.info(f"Payment SUCCESS: {result['mpesa_receipt']} | KSh {result['amount']}")
        # TODO: Update payment record in DB, notify tenant
    else:
        logger.warning(f"Payment FAILED: {result['result_desc']}")
    
    return {"ResultCode": 0, "ResultDesc": "Accepted"}

@router.post("/webhooks/mpesa/timeout")
async def mpesa_timeout(request: Request):
    """Handle STK Push timeout."""
    body = await request.json()
    logger.warning(f"M-Pesa timeout: {body}")
    return {"ResultCode": 0, "ResultDesc": "Accepted"}
