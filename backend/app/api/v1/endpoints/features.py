from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.schemas.feature import (
    AssignTemplateRequest,
    FeatureRead,
    TemplateRead,
    TenantFeatureUpdate,
)
from app.services.feature_service import FeatureService
import uuid

router = APIRouter()


@router.get("/templates", response_model=List[TemplateRead])
async def list_templates(
    db: AsyncSession = Depends(get_db),
):
    """List all business templates (public — used during onboarding)."""
    svc = FeatureService(db)
    return await svc.list_templates()


@router.get("/features", response_model=List[FeatureRead])
async def list_features(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """List all available features (admin)."""
    svc = FeatureService(db)
    return await svc.list_features()


@router.get("/tenant-features", response_model=List[str])
async def get_tenant_features(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Returns list of enabled feature keys for the current tenant."""
    svc = FeatureService(db)
    return await svc.get_tenant_features(uuid.UUID(tenant_id))


@router.post("/tenant-features/assign", response_model=List[str])
async def assign_template_to_tenant(
    body: AssignTemplateRequest,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Apply all features from a template to the current tenant."""
    svc = FeatureService(db)
    assigned = await svc.assign_template(uuid.UUID(tenant_id), body.template_key)
    if not assigned:
        raise HTTPException(status_code=404, detail=f"Template '{body.template_key}' not found")
    await db.commit()
    # Reload features to return keys
    keys = await svc.get_tenant_features(uuid.UUID(tenant_id))
    return keys


@router.patch("/tenant-features/{feature_key}", response_model=dict)
async def toggle_feature(
    feature_key: str,
    body: TenantFeatureUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a feature for the current tenant."""
    svc = FeatureService(db)
    try:
        tf = await svc.toggle_feature(uuid.UUID(tenant_id), feature_key, body.enabled)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    await db.commit()
    return {"feature_key": feature_key, "enabled": tf.enabled}
