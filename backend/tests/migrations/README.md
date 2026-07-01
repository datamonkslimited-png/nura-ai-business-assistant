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

