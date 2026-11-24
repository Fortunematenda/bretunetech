#!/usr/bin/env bash
# Logical PostgreSQL backup for BretuneTech newsletter/deploy safety.
# Usage: bash scripts/newsletter-db-backup.sh [output-dir]
# Requires: pg_dump, DATABASE_URL in backend/.env (or env).
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${1:-/var/backups/bretunetech/db}"
mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR" 2>/dev/null || true

if [[ -z "${DATABASE_URL:-}" && -f "$ROOT/backend/.env" ]]; then
  # shellcheck disable=SC1091
  set -a
  # Load only DATABASE_URL without sourcing the whole file into the shell if possible.
  DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ROOT/backend/.env" | head -n1 | cut -d= -f2- | sed 's/^"//;s/"$//')"
  set +a
fi
[[ -n "${DATABASE_URL:-}" ]] || { echo "DATABASE_URL is required" >&2; exit 1; }

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$OUT_DIR/bretunetech-${STAMP}.dump"
echo "Writing database backup to $FILE"
pg_dump --format=custom --no-owner --no-acl --dbname="$DATABASE_URL" --file="$FILE"
echo "Backup complete: $FILE"
echo "$FILE"
