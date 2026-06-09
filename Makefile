.PHONY: dev-up dev-down migrate seed build test logs

# ── Local dev ────────────────────────────────────────────────
dev-up:
	docker compose up -d

dev-down:
	docker compose down

# ── Database ─────────────────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head

seed:
	docker compose exec backend python -m app.scripts.seed

# ── Build ────────────────────────────────────────────────────
build:
	docker compose build --no-cache

# ── Tests ────────────────────────────────────────────────────
test:
	docker compose exec backend pytest -v

# ── Logs ─────────────────────────────────────────────────────
logs:
	docker compose logs -f backend
