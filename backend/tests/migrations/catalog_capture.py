"""Guarded, read-only PostgreSQL structural catalog capture.

The output contains schema metadata only. No application table rows are queried.
"""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from safety import require_disposable_database
from schema_fingerprint import normalize_snapshot


READ_ONLY_QUERY = "SET TRANSACTION READ ONLY"

COLUMNS_QUERY = """
SELECT
    c.table_name,
    c.ordinal_position,
    c.column_name,
    c.udt_name AS column_type,
    c.is_nullable,
    c.column_default
FROM information_schema.columns AS c
JOIN information_schema.tables AS t
  ON t.table_schema = c.table_schema
 AND t.table_name = c.table_name
WHERE c.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY c.table_name, c.ordinal_position
"""

KEY_CONSTRAINTS_QUERY = """
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON kcu.constraint_schema = tc.constraint_schema
 AND kcu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position
"""

FOREIGN_KEYS_QUERY = """
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    referred_kcu.table_name AS referred_table,
    referred_kcu.column_name AS referred_column,
    rc.delete_rule AS on_delete,
    kcu.ordinal_position
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON kcu.constraint_schema = tc.constraint_schema
 AND kcu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_schema = tc.constraint_schema
 AND rc.constraint_name = tc.constraint_name
JOIN information_schema.key_column_usage AS referred_kcu
  ON referred_kcu.constraint_schema = rc.unique_constraint_schema
 AND referred_kcu.constraint_name = rc.unique_constraint_name
 AND referred_kcu.ordinal_position = kcu.position_in_unique_constraint
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position
"""

INDEXES_QUERY = """
SELECT
    tbl.relname AS table_name,
    idx.relname AS index_name,
    ix.indisunique AS is_unique,
    ARRAY_AGG(att.attname ORDER BY key.ordinality)
      FILTER (WHERE att.attname IS NOT NULL) AS columns,
    pg_get_expr(ix.indpred, ix.indrelid) AS predicate
FROM pg_catalog.pg_index AS ix
JOIN pg_catalog.pg_class AS tbl ON tbl.oid = ix.indrelid
JOIN pg_catalog.pg_class AS idx ON idx.oid = ix.indexrelid
JOIN pg_catalog.pg_namespace AS ns ON ns.oid = tbl.relnamespace
LEFT JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS key(attnum, ordinality)
  ON TRUE
LEFT JOIN pg_catalog.pg_attribute AS att
  ON att.attrelid = tbl.oid
 AND att.attnum = key.attnum
WHERE ns.nspname = 'public'
  AND NOT ix.indisprimary
GROUP BY tbl.relname, idx.relname, ix.indisunique, ix.indpred, ix.indrelid
ORDER BY tbl.relname, idx.relname
"""

ENUMS_QUERY = """
SELECT t.typname AS enum_name, e.enumlabel, e.enumsortorder
FROM pg_catalog.pg_type AS t
JOIN pg_catalog.pg_enum AS e ON e.enumtypid = t.oid
JOIN pg_catalog.pg_namespace AS ns ON ns.oid = t.typnamespace
WHERE ns.nspname = 'public'
ORDER BY t.typname, e.enumsortorder
"""

EXTENSIONS_QUERY = """
SELECT extname
FROM pg_catalog.pg_extension
ORDER BY extname
"""

ALEMBIC_TABLE_QUERY = "SELECT to_regclass('public.alembic_version') IS NOT NULL"
ALEMBIC_VERSION_QUERY = "SELECT version_num FROM public.alembic_version"


async def _mapping_rows(connection, query: str) -> list[dict[str, Any]]:
    result = await connection.execute(text(query))
    return [dict(row) for row in result.mappings().all()]


def _empty_table() -> dict[str, Any]:
    return {
        "columns": [],
        "primary_key": [],
        "foreign_keys": [],
        "unique_constraints": [],
        "indexes": [],
    }


def build_snapshot(
    *,
    columns: list[dict[str, Any]],
    key_constraints: list[dict[str, Any]],
    foreign_keys: list[dict[str, Any]],
    indexes: list[dict[str, Any]],
    enums: list[dict[str, Any]],
    extensions: list[dict[str, Any]],
    alembic_version: str | None,
) -> dict[str, Any]:
    """Convert sanitized catalog rows to the shared fingerprint shape."""
    tables: dict[str, dict[str, Any]] = {}
    for row in columns:
        table = tables.setdefault(str(row["table_name"]), _empty_table())
        table["columns"].append(
            {
                "name": row["column_name"],
                "type": row["column_type"],
                "nullable": str(row["is_nullable"]).upper() == "YES",
                "default": row.get("column_default"),
            }
        )

    grouped_keys: dict[tuple[str, str, str], list[tuple[int, str]]] = {}
    for row in key_constraints:
        key = (
            str(row["table_name"]),
            str(row["constraint_name"]),
            str(row["constraint_type"]),
        )
        grouped_keys.setdefault(key, []).append(
            (int(row["ordinal_position"]), str(row["column_name"]))
        )
    for (table_name, constraint_name, constraint_type), values in grouped_keys.items():
        table = tables.setdefault(table_name, _empty_table())
        names = [name for _, name in sorted(values)]
        if constraint_type == "PRIMARY KEY":
            table["primary_key"] = names
        else:
            table["unique_constraints"].append(
                {"name": constraint_name, "columns": names}
            )

    grouped_fks: dict[tuple[str, str, str, str], list[tuple[int, str, str]]] = {}
    for row in foreign_keys:
        key = (
            str(row["table_name"]),
            str(row["constraint_name"]),
            str(row["referred_table"]),
            str(row.get("on_delete") or ""),
        )
        grouped_fks.setdefault(key, []).append(
            (
                int(row["ordinal_position"]),
                str(row["column_name"]),
                str(row["referred_column"]),
            )
        )
    for (table_name, name, referred_table, on_delete), values in grouped_fks.items():
        ordered = sorted(values)
        tables.setdefault(table_name, _empty_table())["foreign_keys"].append(
            {
                "name": name,
                "columns": [value[1] for value in ordered],
                "referred_table": referred_table,
                "referred_columns": [value[2] for value in ordered],
                "on_delete": on_delete,
            }
        )

    for row in indexes:
        tables.setdefault(str(row["table_name"]), _empty_table())["indexes"].append(
            {
                "name": row["index_name"],
                "columns": list(row.get("columns") or []),
                "unique": bool(row["is_unique"]),
                "predicate": row.get("predicate"),
            }
        )

    enum_values: dict[str, list[tuple[float, str]]] = {}
    for row in enums:
        enum_values.setdefault(str(row["enum_name"]), []).append(
            (float(row["enumsortorder"]), str(row["enumlabel"]))
        )

    snapshot = {
        "tables": tables,
        "enums": {
            name: [label for _, label in sorted(values)]
            for name, values in enum_values.items()
        },
        "extensions": [str(row["extname"]) for row in extensions],
        "alembic_version": alembic_version,
    }
    return normalize_snapshot(snapshot)


async def capture_from_connection(connection) -> dict[str, Any]:
    """Capture structural metadata using an already-open connection."""
    await connection.execute(text(READ_ONLY_QUERY))
    columns = await _mapping_rows(connection, COLUMNS_QUERY)
    key_constraints = await _mapping_rows(connection, KEY_CONSTRAINTS_QUERY)
    foreign_keys = await _mapping_rows(connection, FOREIGN_KEYS_QUERY)
    indexes = await _mapping_rows(connection, INDEXES_QUERY)
    enums = await _mapping_rows(connection, ENUMS_QUERY)
    extensions = await _mapping_rows(connection, EXTENSIONS_QUERY)

    result = await connection.execute(text(ALEMBIC_TABLE_QUERY))
    has_alembic_table = bool(result.scalar_one())
    alembic_version = None
    if has_alembic_table:
        result = await connection.execute(text(ALEMBIC_VERSION_QUERY))
        alembic_version = result.scalar_one_or_none()

    return build_snapshot(
        columns=columns,
        key_constraints=key_constraints,
        foreign_keys=foreign_keys,
        indexes=indexes,
        enums=enums,
        extensions=extensions,
        alembic_version=alembic_version,
    )


async def capture_schema() -> dict[str, Any]:
    """Capture a guarded disposable database inside a read-only transaction."""
    database_url = require_disposable_database()
    engine = create_async_engine(database_url, pool_pre_ping=True)
    try:
        async with engine.connect() as connection:
            async with connection.begin():
                return await capture_from_connection(connection)
    finally:
        await engine.dispose()


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Capture sanitized structural metadata from a disposable test database"
    )
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    snapshot = asyncio.run(capture_schema())
    args.output.write_text(
        json.dumps(snapshot, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Schema fingerprint written to {args.output}")


if __name__ == "__main__":
    main()
