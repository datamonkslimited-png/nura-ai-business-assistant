from typing import Optional, List
from pydantic import BaseModel
import uuid
from datetime import datetime


class OrderItemCreate(BaseModel):
    product_id: Optional[uuid.UUID] = None
    product_name: str
    quantity: int = 1
    unit_price: int


class OrderCreate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    items: List[OrderItemCreate]
    notes: Optional[str] = None
    channel: str = "manual"


class OrderItemRead(BaseModel):
    id: uuid.UUID
    product_name: str
    quantity: int
    unit_price: int
    total_price: int

    model_config = {"from_attributes": True}


class OrderRead(BaseModel):
    id: uuid.UUID
    order_number: str
    status: str
    subtotal: int
    total: int
    notes: Optional[str]
    channel: str
    customer_id: Optional[uuid.UUID]
    items: List[OrderItemRead] = []
    created_at: datetime

    model_config = {"from_attributes": True}
