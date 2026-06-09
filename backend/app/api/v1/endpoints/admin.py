from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import require_admin
from app.models.tenant import Tenant, TenantStatus
from app.models.customer import Customer
from app.models.order import Order
from app.models.message import Message
from app.services.tenant_service import TenantService

router = APIRouter()


@router.get("/stats")
async def platform_stats(
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_tenants = (await db.execute(select(func.count()).select_from(Tenant))).scalar_one()
    active_tenants = (await db.execute(
        select(func.count()).where(Tenant.status == TenantStatus.active)
    )).scalar_one()
    total_customers = (await db.execute(select(func.count()).select_from(Customer))).scalar_one()
    total_orders = (await db.execute(select(func.count()).select_from(Order))).scalar_one()
    total_messages = (await db.execute(select(func.count()).select_from(Message))).scalar_one()

    return {
        "tenants_total": total_tenants,
        "tenants_active": active_tenants,
        "customers_total": total_customers,
        "orders_total": total_orders,
        "messages_total": total_messages,
    }


@router.get("/tenants")
async def list_tenants(
    limit: int = 50,
    offset: int = 0,
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    svc = TenantService(db)
    tenants = await svc.list_all(limit, offset)
    return {"items": tenants, "count": len(tenants)}


@router.patch("/tenants/{tenant_id}/status")
async def set_tenant_status(
    tenant_id: str,
    status: str,
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    svc = TenantService(db)
    tenant = await svc.update(uuid.UUID(tenant_id), {"status": status})
    await db.commit()
    return {"id": str(tenant.id), "status": tenant.status}
