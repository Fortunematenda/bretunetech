#!/usr/bin/env bash
# BretuneTech only. Builds and restores runtime artifacts; does NOT roll back DB or Git source.
set -Eeuo pipefail
cd /var/www/bretunetech
OLD=${1:?Pass previous Git revision}
FORCE=${2:-0}
NEW=$(git rev-parse HEAD)
BACKUP_ROOT=/var/backups/bretunetech
PENDING="$BACKUP_ROOT/recovery-required"
mkdir -p "$BACKUP_ROOT"
chmod 700 "$BACKUP_ROOT"

changed() { ! git diff --quiet "$OLD" "$NEW" -- "$@"; }
BACKEND=0; FRONTEND=0
# If an earlier deployment rolled back runtime files, the checkout can still be at the
# newer revision. Force both applications to rebuild rather than skipping as 'unchanged'.
if [[ -f "$PENDING" ]]; then
  echo "Previous deployment requires recovery: $(cat "$PENDING")"
  FORCE=1
fi
if [[ "$FORCE" == 1 ]] || changed backend ecosystem.config.js scripts/deploy-production.sh .github/workflows/main.yml; then BACKEND=1; fi
if [[ "$FORCE" == 1 ]] || changed frontend ecosystem.config.js scripts/deploy-production.sh .github/workflows/main.yml; then FRONTEND=1; fi
if (( ! BACKEND && ! FRONTEND )); then echo 'No application changes; nothing to deploy'; exit 0; fi

# Create an isolated backup for this attempt. Never prune a backup needed for recovery.
BACKUP=$(mktemp -d "$BACKUP_ROOT/$(date -u +%Y%m%dT%H%M%SZ)-${OLD:0:12}-XXXXXXXX")
printf 'old=%s\nnew=%s\n' "$OLD" "$NEW" > "$BACKUP/versions.txt"
backup_path() {
  local item=$1
  mkdir -p "$BACKUP/$(dirname "$item")"
  if [[ -e "$item" ]]; then cp -a "$item" "$BACKUP/$item";
  else touch "$BACKUP/$item.was-absent"; fi
}

restore_path() {
  local item=$1

  if [[ -e "$BACKUP/$item" ]]; then
    rm -rf -- "$item"
    cp -a -- "$BACKUP/$item" "$item"

  elif [[ -f "$BACKUP/$item.was-absent" ]]; then
    rm -rf -- "$item"

  else
    echo "CRITICAL: Missing backup for $item" >&2
    return 1
  fi
}

if (( BACKEND )); then backup_path backend/node_modules; backup_path backend/dist; fi
if (( FRONTEND )); then backup_path frontend/node_modules; backup_path frontend/.next; fi

pm2_online() {
  local name=$1
  pm2 jlist | node -e '
    let input="";
    process.stdin.on("data",chunk=>input+=chunk);
    process.stdin.on("end",()=>{
      try {
        const name=process.argv[1];
        const apps=JSON.parse(input).filter(p=>p.name===name);
        process.exit(apps.length===1 && apps[0].pm2_env.status==="online" ? 0 : 1);
      } catch (_) {process.exit(1);}
    });' "$name"
}
healthy() {
  local stamp api web
  stamp=$(date +%s%N)
  if (( BACKEND )); then pm2_online bretunetech-backend || return 1; fi
  if (( FRONTEND )); then pm2_online bretunetech-frontend || return 1; fi
  api=$(curl --fail --silent --show-error --max-time 10 -H 'Cache-Control: no-cache' \
    -o /dev/null -w '%{http_code}' "https://bretunetech.com/api/health?ci_check=$stamp") || return 1
  web=$(curl --fail --silent --show-error --max-time 10 -H 'Cache-Control: no-cache' \
    -o /dev/null -w '%{http_code}' "https://bretunetech.com/?ci_check=$stamp") || return 1
  echo "API=$api Website=$web"
  [[ "$api" == 200 && "$web" == 200 ]]
}
wait_healthy() {
  local i
  for i in $(seq 1 12); do
    if healthy; then return 0; fi
    sleep 5
  done
  return 1
}
rollback() {
  local code=$?
  trap - ERR INT TERM
  echo "DEPLOYMENT FAILED (exit $code). Restoring runtime from $BACKUP" >&2
  printf 'Failed deployment: old=%s new=%s backup=%s\n' "$OLD" "$NEW" "$BACKUP" > "$PENDING"
  local recovery_failed=0
  if (( BACKEND )); then
    restore_path backend/node_modules || recovery_failed=1
    restore_path backend/dist || recovery_failed=1
    pm2 restart bretunetech-backend || recovery_failed=1
  fi
  if (( FRONTEND )); then
    restore_path frontend/node_modules || recovery_failed=1
    restore_path frontend/.next || recovery_failed=1
    pm2 restart bretunetech-frontend || recovery_failed=1
  fi
  if ! wait_healthy; then recovery_failed=1; fi
  if (( recovery_failed )); then
    echo 'CRITICAL: runtime recovery failed health verification. Manual intervention needed.' >&2
  else
    echo 'Runtime recovery passed health checks. Git source and database were NOT rolled back.' >&2
  fi
  echo "Recovery marker retained at $PENDING. Backup: $BACKUP" >&2
  exit "$code"
}
trap rollback ERR INT TERM

if (( BACKEND )); then
  npm ci --prefix backend --no-audit --no-fund
  ( cd backend; npx prisma generate; npm run build )
  test -f backend/dist/src/server.js
fi
if (( FRONTEND )); then
  npm ci --prefix frontend --no-audit --no-fund
  ( cd frontend; npm run build )
  test -d frontend/.next
fi
if (( BACKEND )); then pm2 restart bretunetech-backend --update-env; fi
if (( FRONTEND )); then pm2 restart bretunetech-frontend --update-env; fi
wait_healthy
trap - ERR INT TERM
rm -f -- "$PENDING"
pm2 status
echo "Deployment passed health checks. Backup retained at $BACKUP"
# Retain at most three recent backup directories; never delete the current backup.
mapfile -t older < <(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | tail -n +4)
for dir in "${older[@]}"; do
  [[ -n "$dir" && "$BACKUP_ROOT/$dir" != "$BACKUP" ]] || continue
  rm -rf -- "$BACKUP_ROOT/$dir"
done
