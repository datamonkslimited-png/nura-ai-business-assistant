"""
NURA API — FastAPI backend
Entry point for the NURA AI Business Assistant platform.
"""

import sentry_sdk
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.database import engine
from app.core import health as health_checks
from app.models.base import Base
import app.models  # noqa: F401 — ensure all models are registered
from app.api.v1.router import api_router


# ── Sentry (production error tracking) ──────────────────────────────────────
if settings.SENTRY_DSN and settings.ENVIRONMENT == "production":
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT,
    )


# ── Rate limiter ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 NURA API starting up...")
    # Create tables (in production use Alembic migrations instead)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database ready")
    yield
    logger.info("👋 NURA API shutting down...")
    await engine.dispose()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="NURA — AI Business Assistant API for Kenyan SMEs",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# API routes
app.include_router(api_router, prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION, "env": settings.ENVIRONMENT}


@app.get("/health/live")
async def health_live():
    """Process-only liveness probe. Does not access external dependencies."""
    return {"status": "alive"}


@app.get("/health/ready")
async def health_ready():
    """Readiness probe for dependencies required to serve application traffic."""
    from fastapi.responses import JSONResponse

    readiness = await health_checks.check_readiness()
    status_code = 200 if readiness["status"] == "ready" else 503
    return JSONResponse(status_code=status_code, content=readiness)


@app.get("/")
async def root():
    return {"message": "NURA API", "docs": "/docs"}
