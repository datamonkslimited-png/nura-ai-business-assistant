from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    tenants,
    customers,
    orders,
    bookings,
    products,
    messages,
    webhooks,
    mpesa,
    ai_agent,
    analytics,
    admin,
    branches,
    staff,
    notifications,
    settings,
    knowledge,
    features,
)

api_router = APIRouter()

api_router.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
api_router.include_router(tenants.router,   prefix="/tenants",   tags=["Tenants"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(orders.router,    prefix="/orders",    tags=["Orders"])
api_router.include_router(bookings.router,  prefix="/bookings",  tags=["Bookings"])
api_router.include_router(products.router,  prefix="/products",  tags=["Products"])
api_router.include_router(messages.router,  prefix="/messages",  tags=["Messages"])
api_router.include_router(webhooks.router,  prefix="/webhooks",  tags=["Webhooks"])
api_router.include_router(mpesa.router,     prefix="/mpesa",     tags=["M-Pesa"])
api_router.include_router(ai_agent.router,  prefix="/ai",        tags=["AI Agent"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router,         prefix="/admin",         tags=["Admin"])
api_router.include_router(branches.router,      prefix="/branches",      tags=["Branches"])
api_router.include_router(staff.router,         prefix="/staff",         tags=["Staff"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(settings.router,      prefix="/settings",      tags=["Settings"])
api_router.include_router(knowledge.router,     prefix="/knowledge",     tags=["Knowledge"])
api_router.include_router(features.router,      prefix="/features",      tags=["Features"])
