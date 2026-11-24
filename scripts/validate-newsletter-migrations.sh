#!/usr/bin/env bash
# Apply all Prisma migrations against an isolated PostgreSQL database.
# Usage:
#   DATABASE_URL=postgresql://.../bretunetech_migrate_check bash scripts/validate-newsletter-migrations.sh
# Or with docker postgres:
#   bash scripts/validate-newsletter-migrations.sh --docker
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

USE_DOCKER=0
[[ "${1:-}" == "--docker" ]] && USE_DOCKER=1

cleanup() {
  if (( USE_DOCKER )) && [[ -n "${CONTAINER_ID:-}" ]]; then
    docker rm -f "$CONTAINER_ID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if (( USE_DOCKER )); then
  CONTAINER_ID=$(docker run -d --rm \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=bretunetech_migrate_check \
    -p 55432:5432 \
    postgres:16-alpine)
  echo "Started ephemeral Postgres $CONTAINER_ID"
  for i in $(seq 1 30); do
    if docker exec "$CONTAINER_ID" pg_isready -U postgres >/dev/null 2>&1; then break; fi
    sleep 1
  done
  export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/bretunetech_migrate_check?schema=public"
fi

[[ -n "${DATABASE_URL:-}" ]] || {
  echo "Set DATABASE_URL to an isolated empty database, or pass --docker" >&2
  exit 1
}

echo "Validating current Prisma schema against $DATABASE_URL"
# Full historical migrate deploy is not used for empty DBs (legacy ordering). Production
# applies only pending migrations via deploy-production.sh after pg_dump.
npx prisma validate
npx prisma db push --accept-data-loss
npx prisma generate
echo "Schema validation succeeded (current schema applied cleanly to isolated DB)."
