from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge_document import KnowledgeDocument


class KnowledgeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, tenant_id: UUID, doc_type: str = None) -> List[KnowledgeDocument]:
        q = select(KnowledgeDocument).where(KnowledgeDocument.tenant_id == tenant_id)
        if doc_type:
            q = q.where(KnowledgeDocument.doc_type == doc_type)
        q = q.order_by(KnowledgeDocument.sort_order, KnowledgeDocument.created_at)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get(self, tenant_id: UUID, doc_id: UUID) -> Optional[KnowledgeDocument]:
        result = await self.db.execute(
            select(KnowledgeDocument)
            .where(KnowledgeDocument.tenant_id == tenant_id)
            .where(KnowledgeDocument.id == doc_id)
        )
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, data: dict) -> KnowledgeDocument:
        doc = KnowledgeDocument(tenant_id=tenant_id, **data)
        self.db.add(doc)
        await self.db.flush()
        return doc

    async def update(self, tenant_id: UUID, doc_id: UUID, data: dict) -> Optional[KnowledgeDocument]:
        doc = await self.get(tenant_id, doc_id)
        if not doc:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(doc, key, value)
        await self.db.flush()
        return doc

    async def delete(self, tenant_id: UUID, doc_id: UUID) -> bool:
        doc = await self.get(tenant_id, doc_id)
        if not doc:
            return False
        await self.db.delete(doc)
        await self.db.flush()
        return True

    async def build_ai_context(self, tenant_id: UUID) -> str:
        """
        Build the knowledge context string to inject into AI system prompt.
        Returns combined string under 3000 chars.
        """
        docs = await self.list(tenant_id)
        active_docs = [d for d in docs if d.is_active]

        sections: dict[str, list[str]] = {}
        for doc in active_docs:
            dtype = doc.doc_type
            if dtype not in sections:
                sections[dtype] = []
            sections[dtype].append(f"{doc.title}\n{doc.content}")

        type_headers = {
            "faq": "Business FAQ",
            "product": "Products/Services",
            "delivery": "Delivery",
            "hours": "Business Hours",
            "policy": "Policies",
            "general": "General Information",
        }

        parts: list[str] = []
        for dtype, entries in sections.items():
            header = type_headers.get(dtype, dtype.title())
            parts.append(f"=== {header} ===")
            parts.extend(entries)

        combined = "\n\n".join(parts)

        # Truncate to 3000 chars
        if len(combined) > 3000:
            combined = combined[:2997] + "..."

        return combined
