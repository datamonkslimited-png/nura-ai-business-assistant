from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_tenant_id
from app.schemas.knowledge_document import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentRead,
    KnowledgeDocumentUpdate,
)
from app.services.knowledge_service import KnowledgeService

router = APIRouter()


@router.get("/", response_model=List[KnowledgeDocumentRead])
async def list_documents(
    doc_type: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = KnowledgeService(db)
    return await svc.list(uuid.UUID(tenant_id), doc_type=doc_type)


@router.post("/", response_model=KnowledgeDocumentRead, status_code=201)
async def create_document(
    body: KnowledgeDocumentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = KnowledgeService(db)
    doc = await svc.create(uuid.UUID(tenant_id), body.model_dump())
    await db.commit()
    return doc


@router.get("/{doc_id}", response_model=KnowledgeDocumentRead)
async def get_document(
    doc_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = KnowledgeService(db)
    doc = await svc.get(uuid.UUID(tenant_id), doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.patch("/{doc_id}", response_model=KnowledgeDocumentRead)
async def update_document(
    doc_id: uuid.UUID,
    body: KnowledgeDocumentUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = KnowledgeService(db)
    doc = await svc.update(
        uuid.UUID(tenant_id), doc_id, body.model_dump(exclude_none=True)
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.commit()
    return doc


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    svc = KnowledgeService(db)
    deleted = await svc.delete(uuid.UUID(tenant_id), doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.commit()
