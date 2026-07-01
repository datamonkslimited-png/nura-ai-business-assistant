"""Offline tests for disposable-database safety guards."""

import pytest

from safety import (
    DATABASE_URL_ENV,
    OPT_IN_ENV,
    UnsafeMigrationTestDatabase,
    require_disposable_database,
    validate_disposable_database_url,
)


SAFE_URL = "postgresql://localhost/nura_migration_test"


def test_guard_requires_explicit_opt_in():
    with pytest.raises(UnsafeMigrationTestDatabase, match=OPT_IN_ENV):
        require_disposable_database({DATABASE_URL_ENV: SAFE_URL})


def test_guard_requires_dedicated_url():
    with pytest.raises(UnsafeMigrationTestDatabase, match=DATABASE_URL_ENV):
        require_disposable_database({OPT_IN_ENV: "1"})


@pytest.mark.parametrize(
    "unsafe_url",
    [
        "postgresql://localhost/nura_db",
        "postgresql://localhost/postgres",
        "postgresql://db.example.invalid/nura_migration_test",
        "sqlite:///nura_migration_test",
        "postgresql://localhost/nura_disposable",
    ],
)
def test_guard_rejects_unsafe_database_targets(unsafe_url):
    with pytest.raises(UnsafeMigrationTestDatabase):
        validate_disposable_database_url(unsafe_url)


def test_guard_accepts_local_test_database():
    assert require_disposable_database(
        {OPT_IN_ENV: "1", DATABASE_URL_ENV: SAFE_URL}
    ) == SAFE_URL


def test_guard_errors_never_include_database_url():
    unsafe_url = "postgresql://sensitive-user:sensitive-password@remote.invalid/nura_test"

    with pytest.raises(UnsafeMigrationTestDatabase) as error:
        validate_disposable_database_url(unsafe_url)

    assert unsafe_url not in str(error.value)
    assert "sensitive-user" not in str(error.value)
    assert "sensitive-password" not in str(error.value)
