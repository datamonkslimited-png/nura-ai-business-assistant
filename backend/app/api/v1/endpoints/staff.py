from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.staff_service import StaffService
from app.schemas.staff import StaffCreate, StaffUpdate, StaffRead
import uuid

router = APIRouter()


@router.get("/", response_model=List[StaffRead])
async def list_staff(
    branch_id: Optional[uuid.UUID] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = StaffService(db)
    return await svc.list(uuid.UUID(tenant_id), branch_id)


@router.post("/", response_model=StaffRead, status_code=201)
async def create_staff(
    body: StaffCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = StaffService(db)
    member = await svc.create(uuid.UUID(tenant_id), body.model_dump())
    await db.commit()
    return member


@router.get("/{staff_id}", response_model=StaffRead)
async def get_staff(
    staff_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = StaffService(db)
    member = await svc.get(uuid.UUID(tenant_id), staff_id)
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return member


@router.patch("/{staff_id}", response_model=StaffRead)
async def update_staff(
    staff_id: uuid.UUID,
    body: StaffUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = StaffService(db)
    member = await svc.update(uuid.UUID(tenant_id), staff_id, body.model_dump(exclude_none=True))
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    await db.commit()
    return member


@router.delete("/{staff_id}", status_code=204)
async def delete_staff(
    staff_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = StaffService(db)
    deleted = await svc.delete(uuid.UUID(tenant_id), staff_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Staff member not found")
    await db.commit()
