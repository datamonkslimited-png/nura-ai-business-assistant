"""Guards for future database-backed migration tests."""

from __future__ import annotations

from collections.abc import Mapping
import os
from urllib.parse import urlsplit


OPT_IN_ENV = "NURA_ALLOW_MIGRATION_TESTS"
DATABASE_URL_ENV = "NURA_MIGRATION_TEST_DATABASE_URL"
ALLOWED_HOSTS = {"localhost", "127.0.0.1", "::1", "postgres", "migration-postgres"}
FORBIDDEN_DATABASES = {
    "nura_db",
    "postgres",
    "template0",
    "template1",
    "production",
    "staging",
}


class UnsafeMigrationTestDatabase(RuntimeError):
    """Raised when migration-test database safeguards are not satisfied."""


def validate_disposable_database_url(url: str) -> None:
    """Validate a URL without returning or including it in an error message."""
    try:
        parsed = urlsplit(url)
        database_name = parsed.path.lstrip("/").lower()
        hostname = (parsed.hostname or "").lower()
        scheme = parsed.scheme.lower()
    except (TypeError, ValueError) as exc:
        raise UnsafeMigrationTestDatabase("Migration test database URL is invalid") from exc

    if scheme not in {"postgresql", "postgresql+asyncpg", "postgres"}:
        raise UnsafeMigrationTestDatabase("Migration tests require PostgreSQL")
    if hostname not in ALLOWED_HOSTS:
        raise UnsafeMigrationTestDatabase(
            "Migration test database host is not explicitly allowed"
        )
    if database_name in FORBIDDEN_DATABASES:
        raise UnsafeMigrationTestDatabase(
            "Migration test database name is explicitly forbidden"
        )
    if "test" not in database_name:
        raise UnsafeMigrationTestDatabase(
            "Migration test database name must contain 'test'"
        )


def require_disposable_database(
    environ: Mapping[str, str] | None = None,
) -> str:
    """Return the opted-in disposable URL after all guards pass.

    Callers must not print or include the returned value in test reports.
    """
    values = os.environ if environ is None else environ
    if values.get(OPT_IN_ENV) != "1":
        raise UnsafeMigrationTestDatabase(
            f"Migration database tests require {OPT_IN_ENV}=1"
        )

    url = values.get(DATABASE_URL_ENV, "")
    if not url:
        raise UnsafeMigrationTestDatabase(
            f"Migration database tests require {DATABASE_URL_ENV}"
        )

    validate_disposable_database_url(url)
    return url

