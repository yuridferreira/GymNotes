#!/usr/bin/env bash
set -euo pipefail

# Simple health & DB checks for the local infra
# Usage: from repo root run `bash infra/check_db.sh` or `npm run infra:check`

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# load .env if present
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

DB=${POSTGRES_DB:-postgres}
USER=${POSTGRES_USER:-postgres}

echo "== Docker compose status =="
docker compose ps

echo "== DB: listing tables in database '$DB' as user '$USER' =="
docker compose exec -T db psql -U "$USER" -d "$DB" -c "\dt" || echo "(failed to list tables)"

echo "== DB: select few rows from users =="
docker compose exec -T db psql -U "$USER" -d "$DB" -c "SELECT id,name,email,created_at FROM users LIMIT 10;" || echo "(no users table or query failed)"

echo "== API: health =="
curl -sS http://localhost:3000/health || echo "(health check failed)"
echo

echo "== API: users =="
curl -sS http://localhost:3000/users || echo "(users endpoint failed)"
echo

echo "== Done =="
