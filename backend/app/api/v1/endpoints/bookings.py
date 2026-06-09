from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.services.booking_service import BookingService
from app.schemas.booking import BookingCreate, BookingRead, BookingUpdate
from app.schemas.common import PaginatedResponse
import uuid, math

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[BookingRead])
async def list_bookings(
    upcoming_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BookingService(db)
    offset = (page - 1) * page_size
    items, total = await svc.list(uuid.UUID(tenant_id), upcoming_only, page_size, offset)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=max(1, math.ceil(total / page_size)))


@router.post("/", response_model=BookingRead, status_code=201)
async def create_booking(
    body: BookingCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BookingService(db)
    booking = await svc.create(uuid.UUID(tenant_id), body.model_dump())
    await db.commit()
    return booking


@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(
    booking_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BookingService(db)
    b = await svc.get(uuid.UUID(tenant_id), booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b


@router.patch("/{booking_id}", response_model=BookingRead)
async def update_booking(
    booking_id: uuid.UUID,
    body: BookingUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BookingService(db)
    b = await svc.update(uuid.UUID(tenant_id), booking_id, body.model_dump(exclude_none=True))
    await db.commit()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b


@router.post("/{booking_id}/cancel", response_model=BookingRead)
async def cancel_booking(
    booking_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = BookingService(db)
    b = await svc.cancel(uuid.UUID(tenant_id), booking_id)
    await db.commit()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b
