"""Pytest safeguards for future database-backed migration tests."""

from __future__ import annotations

from pathlib import Path
import sys

import pytest


MIGRATIONS_TEST_ROOT = Path(__file__).resolve().parent
if str(MIGRATIONS_TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(MIGRATIONS_TEST_ROOT))

from safety import require_disposable_database


def pytest_addoption(parser):
    parser.addoption(
        "--run-migration-db-tests",
        action="store_true",
        default=False,
        help="Run explicitly marked tests against an opted-in disposable database",
    )


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "migration_db: requires an explicitly opted-in disposable PostgreSQL database",
    )


def pytest_collection_modifyitems(config, items):
    if config.getoption("--run-migration-db-tests"):
        return
    skip = pytest.mark.skip(
        reason="database-backed migration tests require --run-migration-db-tests"
    )
    for item in items:
        if "migration_db" in item.keywords:
            item.add_marker(skip)


@pytest.fixture(scope="session")
def migration_test_database_url(request):
    """Provide a guarded URL only to explicitly enabled database tests."""
    if not request.config.getoption("--run-migration-db-tests"):
        pytest.skip("database-backed migration tests were not enabled")
    return require_disposable_database()
