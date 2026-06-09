from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, get_current_tenant_id
from app.services.tenant_service import TenantService
from app.schemas.tenant import TenantCreate, TenantRead, TenantUpdate
import uuid, re

router = APIRouter()


@router.post("/", response_model=TenantRead, status_code=201)
async def create_tenant(
    body: TenantCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = TenantService(db)
    # Check slug uniqueness
    existing = await svc.get_by_slug(body.slug)
    if existing:
        raise HTTPException(status_code=409, detail="Slug already taken")

    tenant = await svc.create(body.model_dump())
    await svc.create_user({
        "tenant_id": tenant.id,
        "supabase_user_id": user["sub"],
        "email": user.get("email", ""),
        "full_name": user.get("user_metadata", {}).get("full_name"),
        "role": "owner",
    })
    await db.commit()
    return tenant


@router.get("/me", response_model=TenantRead)
async def get_my_tenant(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = TenantService(db)
    tenant = await svc.get_by_id(uuid.UUID(tenant_id))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.patch("/me", response_model=TenantRead)
async def update_my_tenant(
    body: TenantUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = TenantService(db)
    tenant = await svc.update(uuid.UUID(tenant_id), body.model_dump(exclude_none=True))
    await db.commit()
    return tenant
