"""
Seed features and business templates.
Run once (idempotent): python -m app.seeds.features_seed
"""
from __future__ import annotations

import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.feature import Feature, BusinessTemplate, TemplateFeature


FEATURES = [
    {"key": "faq_bot",            "name": "FAQ Bot",                 "category": "ai"},
    {"key": "product_catalog",    "name": "Product Catalog",         "category": "ai"},
    {"key": "order_taking",       "name": "Order Taking",            "category": "ai"},
    {"key": "multi_item_cart",    "name": "Multi-Item Cart",         "category": "ai"},
    {"key": "booking",            "name": "Appointment Booking",     "category": "ai"},
    {"key": "google_calendar",    "name": "Google Calendar Sync",    "category": "ai"},
    {"key": "mpesa_stk",          "name": "M-Pesa STK Push",         "category": "payment"},
    {"key": "mpesa_passive",      "name": "M-Pesa Passive Details",  "category": "payment"},
    {"key": "human_handoff",      "name": "Human Handoff",           "category": "ai"},
    {"key": "lead_capture",       "name": "Lead Capture",            "category": "ai"},
    {"key": "order_escalation",   "name": "Order Escalation Chain",  "category": "ai"},
    {"key": "analytics",          "name": "Analytics Dashboard",     "category": "dashboard"},
    {"key": "bulk_campaigns",     "name": "Bulk Campaigns",          "category": "communication"},
]

TEMPLATES = [
    {
        "key": "salon",
        "name": "Salon & Spa",
        "icon": "✂️",
        "features": ["faq_bot", "booking", "google_calendar", "human_handoff", "lead_capture", "analytics"],
    },
    {
        "key": "bakery",
        "name": "Bakery & Food",
        "icon": "🍞",
        "features": [
            "faq_bot", "product_catalog", "order_taking", "multi_item_cart",
            "mpesa_stk", "mpesa_passive", "human_handoff", "order_escalation",
            "lead_capture", "analytics",
        ],
    },
    {
        "key": "travel",
        "name": "Tour & Safari",
        "icon": "✈️",
        "features": ["faq_bot", "human_handoff", "lead_capture", "analytics"],
    },
    {
        "key": "clinic",
        "name": "Clinic & Pharmacy",
        "icon": "🏥",
        "features": ["faq_bot", "booking", "google_calendar", "human_handoff", "lead_capture", "analytics"],
    },
    {
        "key": "retail",
        "name": "Retail Shop",
        "icon": "🛍️",
        "features": [
            "faq_bot", "product_catalog", "order_taking", "multi_item_cart",
            "mpesa_stk", "human_handoff", "order_escalation", "lead_capture", "analytics",
        ],
    },
]


async def seed(db: AsyncSession) -> None:
    """Idempotent seed — skips rows that already exist by key."""
    # Seed features
    feature_map: dict[str, Feature] = {}
    for fdata in FEATURES:
        result = await db.execute(select(Feature).where(Feature.key == fdata["key"]))
        feature = result.scalar_one_or_none()
        if not feature:
            feature = Feature(**fdata)
            db.add(feature)
            await db.flush()
            print(f"  Created feature: {fdata['key']}")
        else:
            print(f"  Feature exists: {fdata['key']}")
        feature_map[feature.key] = feature

    # Seed templates
    for tdata in TEMPLATES:
        feature_keys = tdata.pop("features")
        result = await db.execute(
            select(BusinessTemplate).where(BusinessTemplate.key == tdata["key"])
        )
        template = result.scalar_one_or_none()
        if not template:
            template = BusinessTemplate(**tdata)
            db.add(template)
            await db.flush()
            print(f"  Created template: {tdata['key']}")
        else:
            print(f"  Template exists: {tdata['key']}")

        # Add template feature assignments
        for fkey in feature_keys:
            feature = feature_map.get(fkey)
            if not feature:
                print(f"    WARNING: feature '{fkey}' not found, skipping")
                continue
            result = await db.execute(
                select(TemplateFeature)
                .where(TemplateFeature.template_id == template.id)
                .where(TemplateFeature.feature_id == feature.id)
            )
            if not result.scalar_one_or_none():
                tf = TemplateFeature(template_id=template.id, feature_id=feature.id)
                db.add(tf)
                await db.flush()

        # Restore feature_keys in tdata for idempotency on next run
        tdata["features"] = feature_keys

    await db.commit()
    print("Seed complete.")


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(main())
