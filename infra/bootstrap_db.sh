#!/usr/bin/env bash
set -euo pipefail

# Load .env from repo root so the script knows POSTGRES_* values when running locally
if [ -f .env ]; then
  # export all variables defined in .env (simple loader; avoids exposing comments)
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Bootstrap DB inside the docker-compose 'db' container:
# 1) copy seed file into container
# 2) create POSTGRES_USER role if it doesn't exist (using postgres superuser)
# 3) run the seed as POSTGRES_USER against POSTGRES_DB

echo "Copying seed file into db container..."
docker cp infra/seed_users.sql "$(docker compose ps -q db)":/tmp/seed_users.sql

echo "Ensuring role $POSTGRES_USER exists (inside container)..."
# Build SQL to create role if missing and pipe it into psql inside the container.
cat <<SQL | docker compose exec -T db psql -U postgres -v ON_ERROR_STOP=1
DO \\\$\\$\nBEGIN\n  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$POSTGRES_USER') THEN\n    PERFORM 1;\n    EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L', '$POSTGRES_USER', '$POSTGRES_PASSWORD');\n  END IF;\nEND\n\\\$\\$;
SQL

echo "Running seed as $POSTGRES_USER against $POSTGRES_DB..."
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/seed_users.sql

echo "Bootstrap complete."
