from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.settings_service import SettingsService
from app.services.agent_toggle_service import agent_toggle
from app.schemas.settings import TenantSettings, TenantSettingsUpdate
import uuid

router = APIRouter()


@router.get("/", response_model=TenantSettings)
async def get_settings(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = SettingsService(db)
    tenant = await svc.get_tenant_settings(uuid.UUID(tenant_id))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.patch("/", response_model=TenantSettings)
async def update_settings(
    body: TenantSettingsUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = SettingsService(db)
    tenant = await svc.update_tenant_settings(uuid.UUID(tenant_id), body.model_dump(exclude_none=True))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    await db.commit()
    return tenant


@router.get("/agent-status")
async def get_agent_status(
    tenant_id: str = Depends(get_current_tenant_id),
):
    enabled = await agent_toggle.is_enabled(tenant_id)
    return {"enabled": enabled}


@router.post("/agent-toggle")
async def toggle_agent(
    tenant_id: str = Depends(get_current_tenant_id),
):
    new_state = await agent_toggle.toggle(tenant_id)
    return {"enabled": new_state}
