"""Deterministic, data-only PostgreSQL schema fingerprints.

This module does not open database connections. Callers must supply a sanitized
catalog snapshot containing structural metadata only.
"""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
import json
import re
from typing import Any, Mapping


SCHEMA_KEYS = (
    "tables",
    "enums",
    "extensions",
    "alembic_version",
)

TABLE_KEYS = (
    "columns",
    "primary_key",
    "foreign_keys",
    "unique_constraints",
    "indexes",
)


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def _normalize_default(value: Any) -> Any:
    if value is None:
        return None
    return _normalize_whitespace(str(value))


def _normalize_column(column: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "name": str(column["name"]),
        "type": _normalize_whitespace(str(column["type"])).lower(),
        "nullable": bool(column["nullable"]),
        "default": _normalize_default(column.get("default")),
    }


def _normalize_foreign_key(foreign_key: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "name": str(foreign_key.get("name") or ""),
        "columns": sorted(str(value) for value in foreign_key.get("columns", [])),
        "referred_table": str(foreign_key["referred_table"]),
        "referred_columns": sorted(
            str(value) for value in foreign_key.get("referred_columns", [])
        ),
        "on_delete": str(foreign_key.get("on_delete") or "").upper(),
    }


def _normalize_named_columns(item: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "name": str(item.get("name") or ""),
        "columns": sorted(str(value) for value in item.get("columns", [])),
    }


def _normalize_index(index: Mapping[str, Any]) -> dict[str, Any]:
    predicate = index.get("predicate")
    return {
        "name": str(index.get("name") or ""),
        "columns": [str(value) for value in index.get("columns", [])],
        "unique": bool(index.get("unique", False)),
        "predicate": (
            _normalize_whitespace(str(predicate)).lower()
            if predicate is not None
            else None
        ),
    }


def _sort_dicts(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(items, key=lambda item: json.dumps(item, sort_keys=True))


def normalize_snapshot(snapshot: Mapping[str, Any]) -> dict[str, Any]:
    """Return a deterministic representation of structural schema metadata."""
    unknown = set(snapshot) - set(SCHEMA_KEYS)
    if unknown:
        raise ValueError(f"Unsupported schema snapshot keys: {sorted(unknown)}")

    normalized_tables: dict[str, Any] = {}
    for table_name, raw_table in sorted(snapshot.get("tables", {}).items()):
        unknown_table_keys = set(raw_table) - set(TABLE_KEYS)
        if unknown_table_keys:
            raise ValueError(
                f"Unsupported keys for table {table_name}: {sorted(unknown_table_keys)}"
            )

        columns = [_normalize_column(column) for column in raw_table.get("columns", [])]
        normalized_tables[str(table_name)] = {
            "columns": sorted(columns, key=lambda column: column["name"]),
            "primary_key": sorted(
                str(value) for value in raw_table.get("primary_key", [])
            ),
            "foreign_keys": _sort_dicts(
                [
                    _normalize_foreign_key(foreign_key)
                    for foreign_key in raw_table.get("foreign_keys", [])
                ]
            ),
            "unique_constraints": _sort_dicts(
                [
                    _normalize_named_columns(constraint)
                    for constraint in raw_table.get("unique_constraints", [])
                ]
            ),
            "indexes": _sort_dicts(
                [_normalize_index(index) for index in raw_table.get("indexes", [])]
            ),
        }

    normalized_enums = {
        str(name): [str(value) for value in values]
        for name, values in sorted(snapshot.get("enums", {}).items())
    }
    normalized_extensions = sorted(
        {
            str(extension).strip().lower()
            for extension in snapshot.get("extensions", [])
        }
    )
    version = snapshot.get("alembic_version")

    return {
        "tables": normalized_tables,
        "enums": normalized_enums,
        "extensions": normalized_extensions,
        "alembic_version": str(version) if version is not None else None,
    }


def fingerprint_json(snapshot: Mapping[str, Any]) -> str:
    """Serialize a normalized snapshot for review or durable comparison."""
    return json.dumps(normalize_snapshot(snapshot), sort_keys=True, separators=(",", ":"))


def fingerprint_digest(snapshot: Mapping[str, Any]) -> str:
    """Return the SHA-256 digest of the normalized schema snapshot."""
    return sha256(fingerprint_json(snapshot).encode("utf-8")).hexdigest()


def compare_snapshots(
    expected: Mapping[str, Any], actual: Mapping[str, Any]
) -> list[dict[str, Any]]:
    """Return stable, path-oriented structural differences between snapshots."""
    differences: list[dict[str, Any]] = []
    _compare_values(
        normalize_snapshot(expected),
        normalize_snapshot(actual),
        path="schema",
        differences=differences,
    )
    return differences


def _compare_values(
    expected: Any,
    actual: Any,
    *,
    path: str,
    differences: list[dict[str, Any]],
) -> None:
    if isinstance(expected, dict) and isinstance(actual, dict):
        for key in sorted(set(expected) | set(actual)):
            child_path = f"{path}.{key}"
            if key not in expected:
                differences.append({"path": child_path, "expected": None, "actual": actual[key]})
            elif key not in actual:
                differences.append({"path": child_path, "expected": expected[key], "actual": None})
            else:
                _compare_values(
                    expected[key],
                    actual[key],
                    path=child_path,
                    differences=differences,
                )
        return

    if expected != actual:
        differences.append(
            {
                "path": path,
                "expected": deepcopy(expected),
                "actual": deepcopy(actual),
            }
        )

