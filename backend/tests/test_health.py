"""Tests for public API health probes."""

from pathlib import Path
import json
import sys

import pytest
from fastapi.testclient import TestClient


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core import health as health_checks
from app.main import app


client = TestClient(app)


def test_existing_health_endpoint_remains_compatible():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json().keys() == {"status", "version", "env"}
    assert response.json()["status"] == "ok"


def test_liveness_is_public_and_process_only(monkeypatch):
    async def must_not_run():
        raise AssertionError("liveness must not check dependencies")

    monkeypatch.setattr(health_checks, "check_readiness", must_not_run)

    response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "alive"}


def test_readiness_success(monkeypatch):
    async def ready():
        return {
            "status": "ready",
            "dependencies": {"database": "ok", "redis": "ok"},
        }

    monkeypatch.setattr(health_checks, "check_readiness", ready)

    response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "dependencies": {"database": "ok", "redis": "ok"},
    }


@pytest.mark.asyncio
async def test_database_check_executes_probe(monkeypatch):
    calls = []

    class FakeConnection:
        async def execute(self, statement):
            calls.append(str(statement))

    class FakeConnectionContext:
        async def __aenter__(self):
            return FakeConnection()

        async def __aexit__(self, exc_type, exc, traceback):
            return False

    class FakeEngine:
        def connect(self):
            return FakeConnectionContext()

    monkeypatch.setattr(health_checks, "engine", FakeEngine())

    assert await health_checks.check_database() is True
    assert calls == ["SELECT 1"]


@pytest.mark.asyncio
async def test_database_check_handles_connection_failure(monkeypatch):
    class FailingConnectionContext:
        async def __aenter__(self):
            raise ConnectionError("sensitive database failure")

        async def __aexit__(self, exc_type, exc, traceback):
            return False

    class FailingEngine:
        def connect(self):
            return FailingConnectionContext()

    monkeypatch.setattr(health_checks, "engine", FailingEngine())

    assert await health_checks.check_database() is False


@pytest.mark.asyncio
async def test_redis_check_pings_and_closes_client(monkeypatch):
    calls = []

    class FakeRedisClient:
        async def ping(self):
            calls.append("ping")
            return True

        async def aclose(self):
            calls.append("close")

    monkeypatch.setattr(
        health_checks.aioredis,
        "from_url",
        lambda *args, **kwargs: FakeRedisClient(),
    )

    assert await health_checks.check_redis() is True
    assert calls == ["ping", "close"]


@pytest.mark.asyncio
async def test_redis_check_handles_ping_failure_and_closes_client(monkeypatch):
    calls = []

    class FailingRedisClient:
        async def ping(self):
            calls.append("ping")
            raise ConnectionError("sensitive redis failure")

        async def aclose(self):
            calls.append("close")

    monkeypatch.setattr(
        health_checks.aioredis,
        "from_url",
        lambda *args, **kwargs: FailingRedisClient(),
    )

    assert await health_checks.check_redis() is False
    assert calls == ["ping", "close"]


@pytest.mark.asyncio
async def test_database_failure_is_reported_without_details(monkeypatch):
    async def database_unavailable():
        return False

    async def redis_available():
        return True

    monkeypatch.setattr(health_checks, "check_database", database_unavailable)
    monkeypatch.setattr(health_checks, "check_redis", redis_available)

    result = await health_checks.check_readiness()

    assert result == {
        "status": "degraded",
        "dependencies": {"database": "unavailable", "redis": "ok"},
    }


@pytest.mark.asyncio
async def test_redis_failure_is_reported_without_details(monkeypatch):
    async def database_available():
        return True

    async def redis_unavailable():
        return False

    monkeypatch.setattr(health_checks, "check_database", database_available)
    monkeypatch.setattr(health_checks, "check_redis", redis_unavailable)

    result = await health_checks.check_readiness()

    assert result == {
        "status": "degraded",
        "dependencies": {"database": "ok", "redis": "unavailable"},
    }


def test_degraded_readiness_returns_503(monkeypatch):
    async def degraded():
        return {
            "status": "degraded",
            "dependencies": {"database": "unavailable", "redis": "ok"},
        }

    monkeypatch.setattr(health_checks, "check_readiness", degraded)

    response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json()["status"] == "degraded"


def test_health_responses_do_not_expose_secrets(monkeypatch):
    secret_markers = {
        "database-url-secret",
        "redis-url-secret",
        "api-token-secret",
        "access-key-secret",
    }

    monkeypatch.setattr(health_checks.settings, "DATABASE_URL", "database-url-secret")
    monkeypatch.setattr(health_checks.settings, "REDIS_URL", "redis-url-secret")
    monkeypatch.setattr(health_checks.settings, "ANTHROPIC_API_KEY", "api-token-secret")
    monkeypatch.setattr(health_checks.settings, "META_APP_SECRET", "access-key-secret")

    async def degraded():
        return {
            "status": "degraded",
            "dependencies": {"database": "unavailable", "redis": "unavailable"},
        }

    monkeypatch.setattr(health_checks, "check_readiness", degraded)

    responses = [
        client.get("/health"),
        client.get("/health/live"),
        client.get("/health/ready"),
    ]
    serialized = json.dumps([response.json() for response in responses])

    assert all(marker not in serialized for marker in secret_markers)
    assert "postgresql" not in serialized.lower()
    assert "redis://" not in serialized.lower()
