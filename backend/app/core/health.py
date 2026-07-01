"""Sanitized dependency checks used by the API readiness probe."""

from __future__ import annotations

import asyncio

import redis.asyncio as aioredis
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine


CHECK_TIMEOUT_SECONDS = 2.0


async def check_database() -> bool:
    """Return whether PostgreSQL accepts a minimal query."""
    try:
        async def query() -> None:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))

        await asyncio.wait_for(query(), timeout=CHECK_TIMEOUT_SECONDS)
        return True
    except Exception:
        return False


async def check_redis() -> bool:
    """Return whether Redis accepts a ping, without exposing connection details."""
    client = None
    try:
        client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        result = await asyncio.wait_for(client.ping(), timeout=CHECK_TIMEOUT_SECONDS)
        return bool(result)
    except Exception:
        return False
    finally:
        if client is not None:
            try:
                await client.aclose()
            except Exception:
                # Cleanup failure must not turn a sanitized readiness result into
                # an unhandled error response.
                pass


async def check_readiness() -> dict[str, object]:
    """Check required dependencies concurrently and return a sanitized result."""
    database_ok, redis_ok = await asyncio.gather(check_database(), check_redis())
    ready = database_ok and redis_ok
    return {
        "status": "ready" if ready else "degraded",
        "dependencies": {
            "database": "ok" if database_ok else "unavailable",
            "redis": "ok" if redis_ok else "unavailable",
        },
    }
