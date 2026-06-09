from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.common import PaginatedResponse
import uuid, math

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ProductRead])
async def list_products(
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    q = select(Product).where(Product.tenant_id == tid)
    if search:
        q = q.where(Product.name.ilike(f"%{search}%"))
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    result = await db.execute(q.order_by(Product.created_at.desc()).limit(page_size).offset((page - 1) * page_size))
    items = list(result.scalars().all())
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=max(1, math.ceil(total / page_size)))


@router.post("/", response_model=ProductRead, status_code=201)
async def create_product(
    body: ProductCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    p = Product(tenant_id=uuid.UUID(tenant_id), **body.model_dump())
    db.add(p)
    await db.commit()
    return p


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: uuid.UUID,
    body: ProductUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    await db.execute(
        update(Product).where(Product.tenant_id == tid, Product.id == product_id).values(**body.model_dump(exclude_none=True))
    )
    await db.commit()
    result = await db.execute(select(Product).where(Product.tenant_id == tid, Product.id == product_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    tid = uuid.UUID(tenant_id)
    result = await db.execute(select(Product).where(Product.tenant_id == tid, Product.id == product_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(p)
    await db.commit()
