#!/usr/bin/env bash
# Initial staging provisioning only. Requires explicit operator approval.
set -Eeuo pipefail
ROOT=/var/www/bretunetech-staging
BRANCH=feature/newsletter-hardening
[[ "${STAGING_APPROVED:-}" == 1 ]] || { echo 'Staging approval required' >&2; exit 2; }
[[ -d "$ROOT/.git" && "$(realpath "$ROOT")" == "$ROOT" ]] || { echo 'Expected isolated staging checkout' >&2; exit 2; }
cd "$ROOT"
[[ "$(git branch --show-current)" == "$BRANCH" ]] || { echo 'Wrong staging branch' >&2; exit 2; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Staging checkout is dirty' >&2; exit 2; }
# Fixed ports match the checked-in PM2 and Nginx configuration.
# If occupied, update all three configurations together before provisioning.
command -v ss >/dev/null
for p in 3005 4005; do
  if [[ -n "$(ss -lntH "sport = :$p")" ]]; then
    echo "Refusing occupied staging port $p" >&2; exit 2
  fi
done
[[ -f backend/.env && -f frontend/.env.local ]] || { echo 'Separate staging env files required' >&2; exit 2; }
git pull --ff-only origin "$BRANCH"
# Prevent inherited production variables from overriding local staging files.
for key in DATABASE_URL DIRECT_URL JWT_SECRET JWT_REFRESH_SECRET NEWSLETTER_TOKEN_SECRET NEWSLETTER_PROVIDER MAIL_MOCK NEWSLETTER_SENDING_ENABLED NEWSLETTER_WORKER_ENABLED RESEND_API_KEY NEWSLETTER_SMTP_PASS SMTP_PASS NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL; do
  unset "$key"
done
export NODE_ENV=production
cd "$ROOT/backend"
# Node 22+ reads dotenv without executing shell expressions.
node --env-file=.env - <<'NODE'
const e = process.env;
function requireSafe(ok, message) { if (!ok) { console.error(message); process.exit(2); } }
let u;
try { u = new URL(e.DATABASE_URL); } catch { requireSafe(false, 'Invalid staging database URL'); }
requireSafe(['postgresql:', 'postgres:'].includes(u.protocol) &&
  u.hostname === '127.0.0.1' && (u.port || '5432') === '5432' &&
  u.pathname === '/bretunetech_staging' && decodeURIComponent(u.username) === 'bretune_staging' &&
  !!u.password && [...u.searchParams].every(([k,v]) => k === 'schema' && v === 'public'),
  'Database must be the exact isolated local staging database and role');
requireSafe(e.NEWSLETTER_PROVIDER === 'mock' && e.MAIL_MOCK === '1' &&
  e.NEWSLETTER_SENDING_ENABLED === 'false' && e.NEWSLETTER_WORKER_ENABLED === 'false',
  'Unsafe staging mail flags');
requireSafe(!e.RESEND_API_KEY && !e.NEWSLETTER_SMTP_PASS && !e.SMTP_PASS, 'Live mail credentials forbidden');
for (const k of ['JWT_SECRET','NEWSLETTER_TOKEN_SECRET']) {
  requireSafe((e[k] || '').length >= 32 && !e[k].includes('CHANGE_ME'), 'Unique staging secrets required');
}
NODE
npm ci --include=dev
node --env-file=.env - <<'NODE'
const {Client} = require('pg');
(async () => {
 const c = new Client({connectionString: process.env.DATABASE_URL});
 await c.connect();
 try {
 const {rows:[r]} = await c.query("SELECT current_database() AS db, current_user AS role, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname=current_user");
 if (r.db !== 'bretunetech_staging' || r.role !== 'bretune_staging' || r.rolsuper || r.rolcreatedb || r.rolcreaterole) throw Error('Unsafe staging database identity or privileges');
 } finally { await c.end(); }
})().catch(() => { console.error('Staging database identity check failed'); process.exit(2); });
NODE
npx prisma generate
# Only for explicitly disposable synthetic staging schema. Not migration validation.
[[ "${STAGING_DISPOSABLE_DB:-}" == 1 ]] || { echo 'Explicit disposable DB acknowledgement required' >&2; exit 2; }
npx prisma db push
npm run build
cd "$ROOT/frontend"
npm ci --include=dev
npm run build
# Deliberately do not start PM2 or expose Nginx automatically: runtime env and
# access controls must be checked independently by the operator first.
echo 'Staging build prepared. Verify PM2 runtime environment, loopback/firewall, TLS and access controls before starting staging apps.'
