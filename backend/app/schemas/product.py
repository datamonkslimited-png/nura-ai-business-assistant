from typing import Optional
from pydantic import BaseModel
import uuid
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: int   # KSh
    stock_quantity: int = 0
    sku: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductRead(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    price: int
    stock_quantity: int
    sku: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
