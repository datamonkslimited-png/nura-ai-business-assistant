# Backend Stabilization Plan

## Phase 0 boundary

This phase stabilizes the current backend without changing domain models, API
contracts, authentication, payment behavior, webhooks, background jobs, or the
frontend. It does not attempt to repair migration history.

## Current startup behavior

Local Docker development starts PostgreSQL and Redis, then runs the backend with
Uvicorn reload enabled. The worker and scheduler run as separate Celery services.
The backend container mounts the source tree into `/app`.

The backend lifespan currently calls `Base.metadata.create_all()` during startup.
This allows missing ORM tables to be created, but it does not apply Alembic
migrations, constraints, indexes, PostgreSQL policies, or data transformations.
It remains in place during Phase 0 because the migration chain cannot build a
clean database.

## Competing schema authorities

Three mechanisms currently describe or create the database:

1. SQLAlchemy ORM metadata, applied by application startup.
2. `database/schema.sql`, mounted into PostgreSQL initialization by Docker Compose.
3. Alembic revisions under `backend/alembic/versions`.

These sources disagree. In particular, revision `0001` is empty, while later
revisions assume base tables already exist. Therefore Alembic cannot currently
create a clean database and `create_all()` must not yet be removed.

## Safe migration repair path

Migration repair must be a separate, reviewed change:

1. Inventory the schema of every deployed environment without modifying it.
2. Select the ORM/domain schema that should become canonical.
3. Compare actual databases, ORM metadata, `schema.sql`, and Alembic revisions.
4. Create and review a truthful baseline for clean installations.
5. Create additive repair migrations for existing installations; do not stamp an
   environment until its schema is proven equivalent to the baseline.
6. Test both an empty-database upgrade and upgrades from deployed states.
7. Only after those tests pass, remove startup `create_all()` and stop mounting
   `schema.sql` for new database initialization.

Alembic should ultimately be the sole schema authority. This phase deliberately
does not edit migrations or `database/schema.sql`.

## Health contract

- `/health` remains the compatibility endpoint.
- `/health/live` confirms only that the API process can answer requests.
- `/health/ready` checks PostgreSQL and Redis with bounded timeouts.
- Readiness returns HTTP 503 when either required dependency is unavailable.
- Responses contain only `ok` or `unavailable` component states. Exception text,
  URLs, credentials, tokens, keys, phone numbers, and tenant data are excluded.

## Deferred stabilization work

The following findings remain intentionally unchanged:

- Tenant isolation is primarily enforced by query filters rather than complete
  foreign keys and database policies.
- Accepted WhatsApp work runs in an in-process background task rather than a
  durable queue.
- Booking reminders, payment reconciliation, campaign delivery, escalation
  notifications, and owner handoff notifications contain placeholder behavior.
- Payment callback persistence and route compatibility require a separately
  scoped, backward-compatible change.
- Authentication membership validation requires dedicated compatibility tests.

These areas should be addressed after the database authority and migration path
are established.
