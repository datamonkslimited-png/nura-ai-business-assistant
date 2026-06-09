from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationRead
import uuid

router = APIRouter()


@router.get("/", response_model=List[NotificationRead])
async def list_notifications(
    unread_only: bool = Query(False),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = NotificationService(db)
    return await svc.list(uuid.UUID(tenant_id), unread_only)


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = NotificationService(db)
    ok = await svc.mark_read(uuid.UUID(tenant_id), notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    await db.commit()
    return {"updated": True}


@router.post("/read-all")
async def mark_all_read(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = NotificationService(db)
    count = await svc.mark_all_read(uuid.UUID(tenant_id))
    await db.commit()
    return {"updated": count}
