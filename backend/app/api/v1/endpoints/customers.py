from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.customer_service import CustomerService
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.schemas.common import PaginatedResponse
import uuid, math

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[CustomerRead])
async def list_customers(
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = CustomerService(db)
    offset = (page - 1) * page_size
    items, total = await svc.list(uuid.UUID(tenant_id), search, page_size, offset)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=max(1, math.ceil(total / page_size)))


@router.post("/", response_model=CustomerRead, status_code=201)
async def create_customer(
    body: CustomerCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = CustomerService(db)
    customer = await svc.create(uuid.UUID(tenant_id), body.model_dump())
    await db.commit()
    return customer


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = CustomerService(db)
    c = await svc.get(uuid.UUID(tenant_id), customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c


@router.patch("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: uuid.UUID,
    body: CustomerUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = CustomerService(db)
    c = await svc.update(uuid.UUID(tenant_id), customer_id, body.model_dump(exclude_none=True))
    await db.commit()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(
    customer_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = CustomerService(db)
    ok = await svc.delete(uuid.UUID(tenant_id), customer_id)
    await db.commit()
    if not ok:
        raise HTTPException(status_code=404, detail="Customer not found")
