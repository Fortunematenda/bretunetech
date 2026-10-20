#!/usr/bin/env bash
# BretuneTech only. Does not touch other PM2 processes or run DB migrations.
set -Eeuo pipefail
cd /var/www/bretunetech
OLD=${1:?Pass old Git revision}
FORCE=${2:-0}
NEW=$(git rev-parse HEAD)

changed() { ! git diff --quiet "$OLD" "$NEW" -- "$@"; }
BACKEND=0
FRONTEND=0
if [[ "$FORCE" == 1 ]] || changed backend ecosystem.config.js scripts/deploy-production.sh .github/workflows/main.yml; then BACKEND=1; fi
if [[ "$FORCE" == 1 ]] || changed frontend ecosystem.config.js scripts/deploy-production.sh .github/workflows/main.yml; then FRONTEND=1; fi
if (( ! BACKEND && ! FRONTEND )); then echo 'No application changes; nothing to deploy'; exit 0; fi

BACKUP_ROOT=/var/backups/bretunetech
BACKUP="$BACKUP_ROOT/$(date -u +%Y%m%dT%H%M%SZ)-$OLD"
mkdir -p "$BACKUP"
printf 'old=%s\nnew=%s\n' "$OLD" "$NEW" > "$BACKUP/versions.txt"

# Copy complete installed dependencies as well as compiled outputs: restores previous runtime,
# even when package.json/lockfile changed. Check free disk space before enabling the workflow.
backup_path() {
  local item=$1
  mkdir -p "$BACKUP/$(dirname "$item")"
  if [[ -e "$item" ]]; then
    cp -a "$item" "$BACKUP/$item"
  else
    touch "$BACKUP/$item.was-absent"
  fi
}
restore_path() {
  local item=$1
  if [[ -e "$BACKUP/$item" ]]; then
    rm -rf "$item"
    cp -a "$BACKUP/$item" "$item"
  elif [[ -e "$BACKUP/$item.was-absent" ]]; then
    rm -rf "$item"
  fi
}

if (( BACKEND )); then
  backup_path backend/node_modules
  backup_path backend/dist
fi
if (( FRONTEND )); then
  backup_path frontend/node_modules
  backup_path frontend/.next
fi

DEPLOY_STARTED=1
rollback() {
  local status=$?
  trap - ERR INT TERM
  echo "Deployment failed (exit $status). Attempting rollback from $BACKUP" >&2
  if (( BACKEND )); then
    restore_path backend/node_modules
    restore_path backend/dist
    pm2 restart bretunetech-backend || true
  fi
  if (( FRONTEND )); then
    restore_path frontend/node_modules
    restore_path frontend/.next
    pm2 restart bretunetech-frontend || true
  fi
  echo "Rollback attempted. Git checkout remains at $NEW; inspect before next deployment." >&2
  exit "$status"
}
trap rollback ERR INT TERM

if (( BACKEND )); then
  npm ci --prefix backend --no-audit --no-fund
  (
    cd backend
    npx prisma generate
    npm run build
  )
  test -f backend/dist/src/server.js
fi
if (( FRONTEND )); then
  npm ci --prefix frontend --no-audit --no-fund
  (cd frontend && npm run build)
  test -d frontend/.next
fi

if (( BACKEND )); then pm2 restart bretunetech-backend --update-env; fi
if (( FRONTEND )); then pm2 restart bretunetech-frontend --update-env; fi

healthy() {
  local api site
  api=$(curl -sS --max-time 10 -o /dev/null -w '%{http_code}' https://bretunetech.com/api/health) || return 1
  site=$(curl -sS --max-time 10 -o /dev/null -w '%{http_code}' https://bretunetech.com/) || return 1
  echo "API=$api Website=$site"
  [[ "$api" == 200 && "$site" == 200 ]]
}
GOOD=0
for i in $(seq 1 12); do
  if healthy; then GOOD=1; break; fi
  sleep 5
done
if (( ! GOOD )); then false; fi

trap - ERR INT TERM
pm2 status
printf 'Deployment healthy. Backup retained at %s\n' "$BACKUP"
# Keep only the three most recent backups for this application.
mapfile -t prior < <(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | tail -n +4)
for dir in "${prior[@]}"; do
  [[ -n "$dir" && "$dir" != '.' && "$dir" != '..' ]] || continue
  rm -rf -- "$BACKUP_ROOT/$dir"
done
