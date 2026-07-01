"""Offline tests for sanitized PostgreSQL catalog capture."""

from __future__ import annotations

from collections import deque

import pytest

from catalog_capture import READ_ONLY_QUERY, build_snapshot, capture_from_connection


class FakeMappings:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class FakeResult:
    def __init__(self, *, rows=None, scalar=None):
        self._rows = rows or []
        self._scalar = scalar

    def mappings(self):
        return FakeMappings(self._rows)

    def scalar_one(self):
        return self._scalar

    def scalar_one_or_none(self):
        return self._scalar


class FakeConnection:
    def __init__(self, results):
        self.results = deque(results)
        self.statements = []

    async def execute(self, statement):
        self.statements.append(str(statement).strip())
        return self.results.popleft()


def test_build_snapshot_contains_only_structural_metadata():
    snapshot = build_snapshot(
        columns=[
            {
                "table_name": "tenants",
                "ordinal_position": 1,
                "column_name": "id",
                "column_type": "uuid",
                "is_nullable": "NO",
                "column_default": None,
            }
        ],
        key_constraints=[
            {
                "table_name": "tenants",
                "constraint_name": "tenants_pkey",
                "constraint_type": "PRIMARY KEY",
                "column_name": "id",
                "ordinal_position": 1,
            }
        ],
        foreign_keys=[],
        indexes=[],
        enums=[],
        extensions=[{"extname": "plpgsql"}],
        alembic_version=None,
    )

    assert snapshot["tables"]["tenants"]["primary_key"] == ["id"]
    assert snapshot["extensions"] == ["plpgsql"]
    assert snapshot["alembic_version"] is None
    assert "rows" not in snapshot
    assert "data" not in snapshot


def test_build_snapshot_groups_constraints_indexes_and_enums():
    snapshot = build_snapshot(
        columns=[
            {
                "table_name": "tenant_users",
                "ordinal_position": 1,
                "column_name": "tenant_id",
                "column_type": "uuid",
                "is_nullable": "NO",
                "column_default": None,
            }
        ],
        key_constraints=[
            {
                "table_name": "tenant_users",
                "constraint_name": "uq_membership",
                "constraint_type": "UNIQUE",
                "column_name": "tenant_id",
                "ordinal_position": 1,
            }
        ],
        foreign_keys=[
            {
                "table_name": "tenant_users",
                "constraint_name": "fk_membership_tenant",
                "column_name": "tenant_id",
                "referred_table": "tenants",
                "referred_column": "id",
                "on_delete": "CASCADE",
                "ordinal_position": 1,
            }
        ],
        indexes=[
            {
                "table_name": "tenant_users",
                "index_name": "ix_membership_tenant",
                "is_unique": False,
                "columns": ["tenant_id"],
                "predicate": None,
            }
        ],
        enums=[
            {"enum_name": "tenant_status", "enumlabel": "active", "enumsortorder": 2},
            {"enum_name": "tenant_status", "enumlabel": "trial", "enumsortorder": 1},
        ],
        extensions=[],
        alembic_version="head",
    )

    table = snapshot["tables"]["tenant_users"]
    assert table["foreign_keys"][0]["referred_table"] == "tenants"
    assert table["unique_constraints"][0]["columns"] == ["tenant_id"]
    assert table["indexes"][0]["columns"] == ["tenant_id"]
    assert snapshot["enums"]["tenant_status"] == ["trial", "active"]


@pytest.mark.asyncio
async def test_capture_sets_read_only_before_catalog_queries():
    connection = FakeConnection(
        [
            FakeResult(),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(scalar=False),
        ]
    )

    snapshot = await capture_from_connection(connection)

    assert connection.statements[0] == READ_ONLY_QUERY
    assert snapshot == {
        "tables": {},
        "enums": {},
        "extensions": [],
        "alembic_version": None,
    }
    assert all(
        statement.upper().startswith(("SET TRANSACTION READ ONLY", "SELECT"))
        for statement in connection.statements
    )


@pytest.mark.asyncio
async def test_capture_reads_alembic_version_only_when_table_exists():
    connection = FakeConnection(
        [
            FakeResult(),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(rows=[]),
            FakeResult(scalar=True),
            FakeResult(scalar="0003"),
        ]
    )

    snapshot = await capture_from_connection(connection)

    assert snapshot["alembic_version"] == "0003"
    assert len(connection.statements) == 9


def test_catalog_queries_do_not_select_application_row_content():
    from catalog_capture import (
        ALEMBIC_TABLE_QUERY,
        ALEMBIC_VERSION_QUERY,
        COLUMNS_QUERY,
        ENUMS_QUERY,
        EXTENSIONS_QUERY,
        FOREIGN_KEYS_QUERY,
        INDEXES_QUERY,
        KEY_CONSTRAINTS_QUERY,
    )

    queries = "\n".join(
        [
            COLUMNS_QUERY,
            KEY_CONSTRAINTS_QUERY,
            FOREIGN_KEYS_QUERY,
            INDEXES_QUERY,
            ENUMS_QUERY,
            EXTENSIONS_QUERY,
            ALEMBIC_TABLE_QUERY,
            ALEMBIC_VERSION_QUERY,
        ]
    ).lower()

    assert " from customers" not in queries
    assert " from messages" not in queries
    assert " from payments" not in queries
    assert " from tenants" not in queries
    assert "database_url" not in queries
    assert "position_in_unique_constraint" in queries
