"""Offline tests for startup schema creation gating."""

from pathlib import Path
import sys

import pytest


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app import main


class FakeConnection:
    def __init__(self, calls: list[str]) -> None:
        self.calls = calls

    async def run_sync(self, fn):
        self.calls.append(f"run_sync:{getattr(fn, '__name__', repr(fn))}")


class FakeBeginContext:
    def __init__(self, calls: list[str]) -> None:
        self.calls = calls

    async def __aenter__(self):
        self.calls.append("begin_enter")
        return FakeConnection(self.calls)

    async def __aexit__(self, exc_type, exc, traceback):
        self.calls.append("begin_exit")
        return False


class FakeEngine:
    def __init__(self) -> None:
        self.calls: list[str] = []

    def begin(self):
        self.calls.append("begin")
        return FakeBeginContext(self.calls)

    async def dispose(self):
        self.calls.append("dispose")


@pytest.mark.asyncio
async def test_lifespan_runs_create_all_when_enabled(monkeypatch):
    fake_engine = FakeEngine()
    monkeypatch.setattr(main, "engine", fake_engine)
    monkeypatch.setattr(main.settings, "DATABASE_AUTO_CREATE_TABLES", True)
    monkeypatch.setattr(main.settings, "ENVIRONMENT", "development")

    async with main.lifespan(object()):
        assert "run_sync:create_all" in fake_engine.calls

    assert fake_engine.calls == [
        "begin",
        "begin_enter",
        "run_sync:create_all",
        "begin_exit",
        "dispose",
    ]


@pytest.mark.asyncio
async def test_lifespan_skips_create_all_when_disabled(monkeypatch):
    fake_engine = FakeEngine()
    monkeypatch.setattr(main, "engine", fake_engine)
    monkeypatch.setattr(main.settings, "DATABASE_AUTO_CREATE_TABLES", False)
    monkeypatch.setattr(main.settings, "ENVIRONMENT", "development")

    async with main.lifespan(object()):
        assert fake_engine.calls == []

    assert fake_engine.calls == ["dispose"]


@pytest.mark.asyncio
async def test_lifespan_disposes_engine_on_shutdown_when_enabled(monkeypatch):
    fake_engine = FakeEngine()
    monkeypatch.setattr(main, "engine", fake_engine)
    monkeypatch.setattr(main.settings, "DATABASE_AUTO_CREATE_TABLES", True)
    monkeypatch.setattr(main.settings, "ENVIRONMENT", "development")

    async with main.lifespan(object()):
        pass

    assert fake_engine.calls[-1] == "dispose"


@pytest.mark.asyncio
async def test_lifespan_disposes_engine_on_shutdown_when_disabled(monkeypatch):
    fake_engine = FakeEngine()
    monkeypatch.setattr(main, "engine", fake_engine)
    monkeypatch.setattr(main.settings, "DATABASE_AUTO_CREATE_TABLES", False)
    monkeypatch.setattr(main.settings, "ENVIRONMENT", "development")

    async with main.lifespan(object()):
        pass

    assert fake_engine.calls == ["dispose"]
