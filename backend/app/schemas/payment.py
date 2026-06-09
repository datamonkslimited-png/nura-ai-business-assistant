from typing import Optional
from pydantic import BaseModel
import uuid
from datetime import datetime


class STKPushRequest(BaseModel):
    phone: str
    amount: int   # KSh (whole number)
    reference: str
    order_id: Optional[uuid.UUID] = None


class PaymentRead(BaseModel):
    id: uuid.UUID
    amount: int
    currency: str
    method: str
    status: str
    mpesa_receipt: Optional[str]
    customer_phone: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
