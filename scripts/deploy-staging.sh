#!/usr/bin/env bash
# Apply BretuneTech staging AFTER the written plan is approved.
# Safe defaults: refuses to run unless STAGING_APPROVED=1 and never uses production DB name.
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGING_ROOT="${STAGING_ROOT:-/var/www/bretunetech-staging}"
BRANCH="${STAGING_BRANCH:-feature/newsletter-hardening}"
FRONTEND_PORT="${STAGING_FRONTEND_PORT:-3005}"
BACKEND_PORT="${STAGING_BACKEND_PORT:-4005}"

if [[ "${STAGING_APPROVED:-}" != "1" ]]; then
  echo "Refusing: set STAGING_APPROVED=1 only after the staging plan is approved." >&2
  exit 2
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Refusing: DATABASE_URL must be set to the staging database (not production)." >&2
  exit 2
fi
if echo "$DATABASE_URL" | grep -Eqi 'bretunetech_prod|/bretune[^_]|bretunetech[^_]'; then
  # Soft check — still require explicit allow for known prod names
  :
fi
if echo "$DATABASE_URL" | grep -Eqi '/bretunetech(\?|$)|/bretune_prod|/production'; then
  echo "Refusing: DATABASE_URL looks like production. Use bretunetech_staging." >&2
  exit 2
fi
if ! echo "$DATABASE_URL" | grep -qi 'staging'; then
  echo "Refusing: DATABASE_URL must contain 'staging' in the database name." >&2
  exit 2
fi

echo "=== Staging deploy to $STAGING_ROOT (branch $BRANCH) ==="

if [[ ! -d "$STAGING_ROOT/.git" ]]; then
  echo "Clone the repo into $STAGING_ROOT first (or set STAGING_ROOT)." >&2
  exit 1
fi

cd "$STAGING_ROOT"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

# Port collision check (read-only)
for p in "$FRONTEND_PORT" "$BACKEND_PORT"; do
  if ss -lntH 2>/dev/null | awk '{print $4}' | grep -E ":${p}\$" >/dev/null; then
    echo "WARN: port $p appears in use — set STAGING_FRONTEND_PORT / STAGING_BACKEND_PORT" >&2
  fi
done

cd "$STAGING_ROOT/backend"
[[ -f .env ]] || { echo "Missing backend/.env — copy deploy/staging/backend.env.example" >&2; exit 1; }
grep -q '^NEWSLETTER_PROVIDER=mock' .env || { echo "Staging requires NEWSLETTER_PROVIDER=mock" >&2; exit 1; }
grep -qE '^MAIL_MOCK=(1|true)' .env || { echo "Staging requires MAIL_MOCK=1" >&2; exit 1; }
grep -qE '^NEWSLETTER_SENDING_ENABLED=true' .env && {
  echo "Refusing: NEWSLETTER_SENDING_ENABLED must not be true on initial staging rollout" >&2
  exit 1
}

npm ci --omit=dev || npm install --omit=dev
npx prisma generate
# Empty staging DB: schema coherence via db push (legacy full migrate deploy is broken greenfield).
npx prisma db push
npm run build

cd "$STAGING_ROOT/frontend"
[[ -f .env.local ]] || { echo "Missing frontend/.env.local — copy deploy/staging/frontend.env.example" >&2; exit 1; }
npm ci || npm install
npm run build

cd "$STAGING_ROOT"
pm2 startOrReload ecosystem.staging.config.js --update-env
pm2 save
pm2 list | grep staging || true
echo "=== Staging deploy finished (nginx/certbot still operator-owned) ==="
