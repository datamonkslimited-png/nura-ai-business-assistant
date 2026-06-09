from __future__ import annotations

from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.feature import Feature, BusinessTemplate, TemplateFeature, TenantFeature


class FeatureService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_features(self) -> List[Feature]:
        result = await self.db.execute(
            select(Feature).where(Feature.is_active == True).order_by(Feature.category, Feature.name)
        )
        return list(result.scalars().all())

    async def list_templates(self) -> List[BusinessTemplate]:
        result = await self.db.execute(
            select(BusinessTemplate)
            .where(BusinessTemplate.is_active == True)
            .options(
                selectinload(BusinessTemplate.feature_assignments).selectinload(
                    TemplateFeature.feature
                )
            )
            .order_by(BusinessTemplate.name)
        )
        return list(result.scalars().all())

    async def get_tenant_features(self, tenant_id: UUID) -> List[str]:
        """Returns list of feature keys enabled for this tenant."""
        result = await self.db.execute(
            select(TenantFeature)
            .where(TenantFeature.tenant_id == tenant_id)
            .where(TenantFeature.enabled == True)
            .options(selectinload(TenantFeature.feature))
        )
        tenant_features = result.scalars().all()
        return [tf.feature.key for tf in tenant_features if tf.feature]

    async def assign_template(self, tenant_id: UUID, template_key: str) -> List[TenantFeature]:
        """Apply all features from template to tenant."""
        # Load template with features
        result = await self.db.execute(
            select(BusinessTemplate)
            .where(BusinessTemplate.key == template_key)
            .options(
                selectinload(BusinessTemplate.feature_assignments).selectinload(
                    TemplateFeature.feature
                )
            )
        )
        template = result.scalar_one_or_none()
        if not template:
            return []

        # Disable all existing tenant features first
        existing_result = await self.db.execute(
            select(TenantFeature).where(TenantFeature.tenant_id == tenant_id)
        )
        for tf in existing_result.scalars().all():
            tf.enabled = False

        created: List[TenantFeature] = []
        for assignment in template.feature_assignments:
            feature = assignment.feature
            if not feature:
                continue

            # Check if tenant feature already exists
            existing = await self.db.execute(
                select(TenantFeature)
                .where(TenantFeature.tenant_id == tenant_id)
                .where(TenantFeature.feature_id == feature.id)
            )
            tf = existing.scalar_one_or_none()
            if tf:
                tf.enabled = True
            else:
                tf = TenantFeature(
                    tenant_id=tenant_id,
                    feature_id=feature.id,
                    enabled=True,
                )
                self.db.add(tf)
                await self.db.flush()

            created.append(tf)

        await self.db.flush()
        return created

    async def toggle_feature(
        self, tenant_id: UUID, feature_key: str, enabled: bool
    ) -> TenantFeature:
        """Enable or disable a feature for a tenant."""
        feature_result = await self.db.execute(
            select(Feature).where(Feature.key == feature_key)
        )
        feature = feature_result.scalar_one_or_none()
        if not feature:
            raise ValueError(f"Feature '{feature_key}' not found")

        existing_result = await self.db.execute(
            select(TenantFeature)
            .where(TenantFeature.tenant_id == tenant_id)
            .where(TenantFeature.feature_id == feature.id)
        )
        tf = existing_result.scalar_one_or_none()
        if tf:
            tf.enabled = enabled
        else:
            tf = TenantFeature(
                tenant_id=tenant_id,
                feature_id=feature.id,
                enabled=enabled,
            )
            self.db.add(tf)

        await self.db.flush()
        return tf
