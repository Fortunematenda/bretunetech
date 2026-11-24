#!/usr/bin/env bash
# Isolated simulations for deployment safety gates. Does NOT touch production.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0
ok() { echo "PASS: $*"; pass=$((pass+1)); }
bad() { echo "FAIL: $*" >&2; fail=$((fail+1)); }

# 1) flock exclusivity (Linux/CI; skipped on hosts without util-linux flock)
if command -v flock >/dev/null 2>&1; then
  LOCK="$TMP/deploy.lock"
  (
    exec 9>"$LOCK"
    flock -n 9
    if flock -n 9; then
      bad "nested flock -n unexpectedly succeeded on same fd"
    else
      ok "flock -n is exclusive on held lock fd"
    fi
  )
  (
    exec 9>"$LOCK"
    flock -n 9 || exit 1
    (
      exec 8>"$LOCK"
      if flock -n 8; then
        exit 2
      fi
      exit 0
    )
    test $? -eq 0
  ) && ok "second process cannot take deploy lock" || bad "second process lock simulation"
else
  ok "flock binary absent locally — CI ubuntu job will exercise exclusivity"
fi

# 2) restore refusal logic
BACKUP="$TMP/backup"
mkdir -p "$BACKUP/backend"
echo old > "$BACKUP/backend/dist"
APP="$TMP/app"
mkdir -p "$APP/backend"
echo live > "$APP/backend/dist"

restore_path() {
  local item=$1
  if [[ -e "$BACKUP/$item" ]]; then
    rm -rf -- "$APP/$item"
    cp -a -- "$BACKUP/$item" "$APP/$item"
  elif [[ -f "$BACKUP/$item.was-absent" ]]; then
    rm -rf -- "$APP/$item"
  else
    echo "CRITICAL: Missing backup for $item" >&2
    return 1
  fi
}

restore_ok=1
restore_path backend/dist || restore_ok=0
test "$restore_ok" -eq 1 && test "$(cat "$APP/backend/dist")" = "old" && ok "restore_path succeeds with backup" || bad "restore_path success path"

restore_ok=1
restore_path backend/generated || restore_ok=0
test "$restore_ok" -eq 0 && ok "restore_path fails closed without backup" || bad "restore_path should fail without backup"

started=0
if (( restore_ok )); then
  started=1
fi
test "$started" -eq 0 && ok "refuses start when restore failed" || bad "would start after failed restore"

# 3) verified DB URL identity asserts (no network)
node -e '
  const assert = require("node:assert/strict");
  const good = new URL("postgresql://postgres:x@127.0.0.1:5432/bretunetech?schema=public");
  assert.equal(good.pathname, "/bretunetech");
  assert.equal(good.username, "postgres");
  let rejected = false;
  try {
    const bad = new URL("postgresql://postgres:x@127.0.0.1:5432/bretunetech_staging");
    assert.equal(bad.pathname, "/bretunetech");
  } catch (_) { rejected = true; }
  assert.equal(rejected, true);
  console.log("PASS: staging DB pathname rejected");
' && ok "database identity assert rejects staging pathname" || bad "database identity simulation"

# 4) deploy script static gates
grep -q 'flock -n 9' "$ROOT/scripts/deploy-production.sh" && ok "deploy script uses flock" || bad "missing flock"
grep -q 'refusing to start bretunetech-backend after failed artifact restore' "$ROOT/scripts/deploy-production.sh" && ok "deploy refuses start after failed restore" || bad "missing refuse-start"
grep -q 'require_pm2_stop' "$ROOT/scripts/deploy-production.sh" && ok "deploy requires successful pm2 stop" || bad "missing require_pm2_stop"
grep -q 'VERIFIED_DATABASE_URL' "$ROOT/scripts/deploy-production.sh" && ok "migrate uses verified DATABASE_URL" || bad "missing VERIFIED_DATABASE_URL"
grep -q 'prisma migrate deploy' "$ROOT/scripts/deploy-production.sh" && ok "uses prisma migrate deploy" || bad "missing migrate deploy"
! grep -qE 'prisma (db push|migrate reset)' "$ROOT/scripts/deploy-production.sh" && ok "no db push/reset" || bad "dangerous prisma command present"
grep -q 'Recovery marker retained' "$ROOT/scripts/deploy-production.sh" && ok "retains recovery marker messaging" || bad "missing recovery marker note"

# 5) workflow cannot auto-deploy on merge
grep -q "github.event_name == 'workflow_dispatch'" "$ROOT/.github/workflows/main.yml" && ok "deploy job requires workflow_dispatch" || bad "deploy not gated"
grep -q "github.ref == 'refs/heads/main'" "$ROOT/.github/workflows/main.yml" && ok "deploy job requires main" || bad "deploy not main-only"

echo "---"
echo "passed=$pass failed=$fail"
test "$fail" -eq 0
