from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.branch_service import BranchService
from app.schemas.branch import BranchCreate, BranchUpdate, BranchRead
from typing import List
import uuid

router = APIRouter()


@router.get("/", response_model=List[BranchRead])
async def list_branches(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BranchService(db)
    return await svc.list(uuid.UUID(tenant_id))


@router.post("/", response_model=BranchRead, status_code=201)
async def create_branch(
    body: BranchCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BranchService(db)
    branch = await svc.create(uuid.UUID(tenant_id), body.model_dump())
    await db.commit()
    return branch


@router.get("/{branch_id}", response_model=BranchRead)
async def get_branch(
    branch_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BranchService(db)
    branch = await svc.get(uuid.UUID(tenant_id), branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.patch("/{branch_id}", response_model=BranchRead)
async def update_branch(
    branch_id: uuid.UUID,
    body: BranchUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BranchService(db)
    branch = await svc.update(uuid.UUID(tenant_id), branch_id, body.model_dump(exclude_none=True))
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    await db.commit()
    return branch


@router.delete("/{branch_id}", status_code=204)
async def delete_branch(
    branch_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BranchService(db)
    deleted = await svc.delete(uuid.UUID(tenant_id), branch_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Branch not found")
    await db.commit()
