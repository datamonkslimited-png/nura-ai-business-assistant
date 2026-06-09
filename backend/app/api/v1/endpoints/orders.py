from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderRead
from app.schemas.common import PaginatedResponse
import uuid, math

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[OrderRead])
async def list_orders(
    status: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = OrderService(db)
    offset = (page - 1) * page_size
    items, total = await svc.list(uuid.UUID(tenant_id), status, page_size, offset)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=max(1, math.ceil(total / page_size)))


@router.post("/", response_model=OrderRead, status_code=201)
async def create_order(
    body: OrderCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = OrderService(db)
    data = body.model_dump()
    order = await svc.create(uuid.UUID(tenant_id), data)
    await db.commit()
    return order


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = OrderService(db)
    o = await svc.get(uuid.UUID(tenant_id), order_id)
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return o


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: uuid.UUID,
    status: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = OrderService(db)
    o = await svc.update_status(uuid.UUID(tenant_id), order_id, status)
    await db.commit()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return o
