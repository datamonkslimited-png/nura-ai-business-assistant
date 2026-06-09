from pydantic import BaseModel


class DashboardStats(BaseModel):
    messages_today: int = 0
    orders_today: int = 0
    revenue_today: int = 0
    active_customers: int = 0
    messages_change_pct: float = 0.0
    orders_change_pct: float = 0.0
    revenue_change_pct: float = 0.0


class RevenueDataPoint(BaseModel):
    date: str
    revenue: int


class AdminStats(BaseModel):
    total_tenants: int = 0
    active_tenants: int = 0
    mrr_kshs: int = 0
    total_ai_calls: int = 0
    new_tenants_this_month: int = 0
