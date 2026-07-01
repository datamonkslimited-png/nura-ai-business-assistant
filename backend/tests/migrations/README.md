# Migration test scaffold

The tests in this directory are offline by default. Unit tests normalize and
compare sanitized catalog snapshots and exercise database safety guards without
opening a connection.

Future tests that create, migrate, or destroy disposable databases must use the
`migration_db` marker and the `migration_test_database_url` fixture:

```python
import pytest


@pytest.mark.migration_db
def test_future_migration(migration_test_database_url):
    ...
```

Marked tests are skipped unless all three conditions are met:

1. Pytest receives `--run-migration-db-tests`.
2. `NURA_ALLOW_MIGRATION_TESTS=1` is set.
3. `NURA_MIGRATION_TEST_DATABASE_URL` identifies an allowed local PostgreSQL
   database whose name contains `test` and is not an active/default database name.

Never reuse the development PostgreSQL volume or its database for these tests.
Never print the guarded URL in test output.

The fixture JSON contains schema metadata only. Fixtures must never include table
rows, customer details, messages, phones, payment references, credentials, or
other tenant data.

## Disposable PostgreSQL service

The repository root contains `docker-compose.migration-test.yml`. It is standalone
and must be invoked with the separate project name `nura-migration-test`. Its only
service is `migration_test_postgres`; it uses database `nura_migration_test`, an
isolated internal network, loopback-only port 55432, and tmpfs storage.

It does not reuse the active `postgres` service, `nura_db`, `postgres_data` volume,
or `nura_network` network. The service is intentionally ephemeral and contains no
application schema unless a future migration test creates one.

Validate configuration without starting it:

```bash
docker compose -p nura-migration-test \
  -f docker-compose.migration-test.yml config --quiet
```

## Guarded catalog capture

`catalog_capture.py` reads PostgreSQL catalogs inside an explicitly read-only
transaction and writes only normalized structural metadata. It requires the same
opt-in variables as database-backed tests and requires an output path:

```bash
python tests/migrations/catalog_capture.py --output /tmp/schema-fingerprint.json
```

Set the opt-in and dedicated URL privately in the invoking environment. Do not echo
them or place them in shell history. The guard will reject active/default database
names, non-test-looking names, remote hosts, and unsupported database schemes.

Catalog capture must never be pointed at the active development database. Although
the transaction is read-only, the disposable-only guard is intentional.
