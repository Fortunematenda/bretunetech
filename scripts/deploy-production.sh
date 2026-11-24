#!/usr/bin/env bash
# BretuneTech only. Builds and restores runtime artifacts; does NOT roll back DB or Git source.
set -Eeuo pipefail
export PATH=/opt/bretunetech-node/bin:$PATH
test "$(node -v)" = "v22.23.5"
cd /var/www/bretunetech
OLD=${1:?Pass previous Git revision}
FORCE=${2:-0}
NEW=$(git rev-parse HEAD)

# Fail closed before any deployment changes.
node --env-file=backend/.env -e '
  for (const key of [
    "NEWSLETTER_SENDING_ENABLED",
    "NEWSLETTER_WORKER_ENABLED"
  ]) {
    if (process.env[key] !== "false") {
      console.error("Deployment blocked: " + key + " must be false");
      process.exit(1);
    }
  }
  console.log("PASS: Newsletter delivery disabled for deployment");
'

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
    pm2 delete bretunetech-backend || true
    pm2 start "$BACKUP/pm2-runtime.json" --only bretunetech-backend || recovery_failed=1
  fi
  if (( FRONTEND )); then
    restore_path frontend/node_modules || recovery_failed=1
    restore_path frontend/.next || recovery_failed=1
    pm2 delete bretunetech-frontend || true
    pm2 start "$BACKUP/pm2-runtime.json" --only bretunetech-frontend || recovery_failed=1
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
# Record existing runtime definitions before changing processes.
pm2 jlist | node -e '
  let input = "";
  process.stdin.on("data", c => input += c);
  process.stdin.on("end", () => {
    const names = ["bretunetech-backend","bretunetech-frontend"];
    const apps = JSON.parse(input).filter(p => names.includes(p.name));
    if (apps.length !== 2) process.exit(1);
    const config = apps.map(p => ({
      name: p.name,
      cwd: p.pm2_env.pm_cwd,
      script: p.pm2_env.pm_exec_path,
      args: p.pm2_env.args || [],
      interpreter: require("node:fs").readlinkSync("/proc/" + p.pid + "/exe"),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: p.pm2_env.max_memory_restart || "512M",
      env: {
        NODE_ENV: "production",
        PORT: p.name.endsWith("-backend") ? 4000 : 3000
      }
    }));
    console.log(JSON.stringify({apps:config},null,2));
  });
' > "$BACKUP/pm2-runtime.json"

test -s "$BACKUP/pm2-runtime.json"

# Existing process configuration is retained for recovery.
trap rollback ERR INT TERM

# Never auto-enable bulk sending or the queue worker from deploy.
# Operators must set NEWSLETTER_SENDING_ENABLED / NEWSLETTER_WORKER_ENABLED manually after review.
warn_newsletter_flags() {
  local file="backend/.env"
  [[ -f "$file" ]] || return 0
  if grep -q '^NEWSLETTER_SENDING_ENABLED=true' "$file" 2>/dev/null; then
    echo "NOTE: NEWSLETTER_SENDING_ENABLED=true is already set in backend/.env (not changed by deploy)."
  else
    echo "Newsletter bulk sending remains off (NEWSLETTER_SENDING_ENABLED is not true)."
  fi
  if grep -q '^NEWSLETTER_WORKER_ENABLED=true' "$file" 2>/dev/null; then
    echo "NOTE: NEWSLETTER_WORKER_ENABLED=true is already set in backend/.env (not changed by deploy)."
  else
    echo "Newsletter queue worker remains off (NEWSLETTER_WORKER_ENABLED is not true)."
  fi
}

# Logical DB backup before migrate. Failures abort deploy (trap → runtime rollback).
# Schema migrations are additive; runtime rollback does NOT reverse SQL — keep the dump.
backup_database() {
  local file="$BACKUP/database.dump"
  local url=""
  if [[ -f backend/.env ]]; then
    url=$(grep -E '^DATABASE_URL=' backend/.env | head -n1 | cut -d= -f2- | sed 's/^"//;s/"$//')
  fi
  if [[ -z "$url" ]]; then
    echo "CRITICAL: DATABASE_URL missing from backend/.env — cannot back up before migrate" >&2
    return 1
  fi
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "CRITICAL: pg_dump not installed — cannot back up before migrate" >&2
    return 1
  fi
  echo "Backing up PostgreSQL to $file"
  umask 077

  DATABASE_URL="$url" BACKUP_FILE="$file" node <<'JS'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const url = new URL(process.env.DATABASE_URL);

assert.equal(url.pathname, '/bretunetech');
assert.equal(url.username, 'postgres');
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));
assert.equal(url.port || '5432', '5432');

const env = {
  ...process.env,
  PGHOST: url.hostname,
  PGPORT: url.port || '5432',
  PGUSER: decodeURIComponent(url.username),
  PGPASSWORD: decodeURIComponent(url.password),
  PGDATABASE: 'bretunetech',
  PGCONNECT_TIMEOUT: '10'
};

delete env.PGSERVICE;
delete env.PGHOSTADDR;

const file = process.env.BACKUP_FILE;

function run(cmd,args) {
  const r = spawnSync(cmd,args,{
    env,
    stdio:'inherit'
  });

  assert.equal(r.status,0,cmd+' failed');
}

run('pg_dump',[
  '--format=custom',
  '--no-owner',
  '--no-acl',
  '--file='+file
]);

assert.ok(fs.statSync(file).size > 0);

const listing = spawnSync('pg_restore',['--list',file],{
  env,
  stdio:'ignore'
});

assert.equal(listing.status,0);

run('pg_restore',['--file=/dev/null',file]);

console.log('PASS: Database backup archive verified');
JS

  printf 'database_backup=%s\n' "$file" >> "$BACKUP/versions.txt"
  echo "Database backup complete."
}

# Apply pending Prisma migrations. On failure: leave DB as-is, abort before PM2 restart.
run_migrations() {
  echo "Applying Prisma migrations (prisma migrate deploy)..."
  (
    cd backend
    npx prisma migrate deploy
  ) || {
    echo "CRITICAL: prisma migrate deploy failed. Aborting before restarting PM2." >&2
    echo "Database backup (if created): $BACKUP/database.dump" >&2
    echo "Restore with: pg_restore --clean --if-exists --no-owner --dbname=\"\$DATABASE_URL\" $BACKUP/database.dump" >&2
    echo "Do NOT enable NEWSLETTER_SENDING_ENABLED until migrations succeed." >&2
    return 1
  }
  echo "Migrations applied successfully."
}

if (( BACKEND )); then
  npm ci --prefix backend --include=dev --no-audit --no-fund
  backup_database
  run_migrations
  ( cd backend; npx prisma generate; npm run build )
  test -f backend/dist/src/server.js
  warn_newsletter_flags
  ( cd backend; npm run newsletter:seed-templates )
fi
if (( FRONTEND )); then
  npm ci --prefix frontend --include=dev --no-audit --no-fund
  ( cd frontend; npm run build )
  test -d frontend/.next
fi
# Restart only after migrate + build succeed. Additive migrations remain if runtime rolls back.
if (( BACKEND )); then
  pm2 delete bretunetech-backend
  pm2 start ecosystem.config.js --only bretunetech-backend
fi
if (( FRONTEND )); then
  pm2 delete bretunetech-frontend
  pm2 start ecosystem.config.js --only bretunetech-frontend
fi
wait_healthy
trap - ERR INT TERM
rm -f -- "$PENDING"
pm2 status
echo "Deployment passed health checks. Runtime backup retained at $BACKUP"
if [[ -f "$BACKUP/database.dump" ]]; then
  echo "Database dump retained at $BACKUP/database.dump (not auto-deleted)."
fi
# Retain at most three recent backup directories; never delete the current backup.
mapfile -t older < <(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | tail -n +4)
for dir in "${older[@]}"; do
  [[ -n "$dir" && "$BACKUP_ROOT/$dir" != "$BACKUP" ]] || continue
  rm -rf -- "$BACKUP_ROOT/$dir"
done
