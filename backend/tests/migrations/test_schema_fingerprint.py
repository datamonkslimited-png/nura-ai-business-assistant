"""Offline tests for deterministic schema fingerprints."""

from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path

import pytest

from schema_fingerprint import (
    compare_snapshots,
    fingerprint_digest,
    fingerprint_json,
    normalize_snapshot,
)


FIXTURE = Path(__file__).parent / "fixtures" / "catalog_snapshot.json"


@pytest.fixture()
def catalog_snapshot():
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def test_normalization_covers_required_schema_components(catalog_snapshot):
    normalized = normalize_snapshot(catalog_snapshot)

    assert normalized.keys() == {
        "tables",
        "enums",
        "extensions",
        "alembic_version",
    }
    tenants = normalized["tables"]["tenants"]
    assert tenants.keys() == {
        "columns",
        "primary_key",
        "foreign_keys",
        "unique_constraints",
        "indexes",
    }
    assert normalized["enums"]["tenant_status"] == [
        "trial",
        "active",
        "suspended",
        "cancelled",
    ]
    assert normalized["extensions"] == ["pg_trgm", "uuid-ossp"]
    assert normalized["alembic_version"] == "canonical_head"


def test_fingerprint_is_deterministic_when_input_order_changes(catalog_snapshot):
    reordered = deepcopy(catalog_snapshot)
    reordered["tables"] = dict(reversed(list(reordered["tables"].items())))
    reordered["extensions"].reverse()
    reordered["tables"]["tenants"]["columns"].reverse()
    reordered["tables"]["tenant_users"]["foreign_keys"].reverse()

    assert fingerprint_json(reordered) == fingerprint_json(catalog_snapshot)
    assert fingerprint_digest(reordered) == fingerprint_digest(catalog_snapshot)


def test_comparison_reports_column_type_and_alembic_version(catalog_snapshot):
    actual = deepcopy(catalog_snapshot)
    actual["tables"]["tenants"]["columns"][1]["type"] = "TEXT"
    actual["alembic_version"] = None

    differences = compare_snapshots(catalog_snapshot, actual)
    paths = {difference["path"] for difference in differences}

    assert "schema.tables.tenants.columns" in paths
    assert "schema.alembic_version" in paths


def test_comparison_reports_missing_table(catalog_snapshot):
    actual = deepcopy(catalog_snapshot)
    del actual["tables"]["tenant_users"]

    differences = compare_snapshots(catalog_snapshot, actual)

    assert differences == [
        {
            "path": "schema.tables.tenant_users",
            "expected": normalize_snapshot(catalog_snapshot)["tables"]["tenant_users"],
            "actual": None,
        }
    ]


def test_normalization_rejects_unknown_snapshot_keys(catalog_snapshot):
    catalog_snapshot["row_data"] = [{"phone": "must never be accepted"}]

    with pytest.raises(ValueError, match="Unsupported schema snapshot keys"):
        normalize_snapshot(catalog_snapshot)


def test_digest_has_stable_sha256_shape(catalog_snapshot):
    digest = fingerprint_digest(catalog_snapshot)

    assert len(digest) == 64
    assert set(digest) <= set("0123456789abcdef")
