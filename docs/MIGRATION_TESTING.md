# Safe Migration Testing

## Purpose

This scaffold prepares NURA to repair its Alembic history without touching the
active development database. It currently provides offline schema fingerprint and
safety-guard tests only. It does not run Alembic or create/drop databases.

## Default safe test run

Run the offline migration tests inside the backend container:

```bash
docker compose exec -T -e PYTHONDONTWRITEBYTECODE=1 backend \
  pytest tests/migrations -p no:cacheprovider -q
```

This command does not enable database-backed migration tests. Any future test
marked `migration_db` is skipped.

## Requirements for a future disposable test database

A safe database must be:

- a dedicated PostgreSQL database created solely for migration tests;
- hosted locally or in a dedicated migration-test container;
- named with `test` in the database name;
- separate from the active NURA development volume and database;
- free of tenant/customer data;
- safe to destroy and recreate as part of a test run.

Database-backed tests require an explicit Pytest flag and two environment
variables. Values must be supplied through the environment and must never be
committed, echoed, logged, or pasted into test reports.

The guard rejects the active development database name, PostgreSQL maintenance
databases, non-test database names, unsupported schemes, and remote hosts.

## Commands that must not target active development

Never run these operations against the active local database or its volume:

- Alembic upgrade, downgrade, stamp, revision, or autogenerate experiments;
- schema creation or replacement;
- `DROP`, `TRUNCATE`, destructive `DELETE`, or database recreation;
- migration tests that assume they own the database;
- seed/reset scripts;
- Docker volume removal.

The migration-test guard reduces accidental targeting risk, but it does not make a
shared database safe. Human verification of the target remains mandatory.

## Schema fingerprints

`tests/migrations/schema_fingerprint.py` accepts sanitized structural metadata and
normalizes:

- tables and columns;
- column type, nullability, and default;
- primary keys;
- foreign keys;
- unique constraints;
- indexes and partial predicates;
- enum names and ordered values;
- extensions;
- the Alembic revision when present.

It produces deterministic JSON, a SHA-256 digest, and path-oriented differences.
It intentionally does not accept row data.

Future catalog capture code should execute read-only PostgreSQL catalog queries,
sanitize results, and pass only structural metadata to this utility.

## How this supports Alembic repair

Before migration files are changed, future work should add disposable-database
fixtures for:

1. an empty database;
2. the complete legacy SQL schema;
3. the observed partial SQL plus ORM hybrid;
4. the ORM-only schema.

Each repair path must converge to the same reviewed fingerprint. Only after clean
and legacy paths pass should NURA remove startup `create_all()` or stop retaining
the SQL bootstrap compatibility path.
