/**
 * Production-readiness schema check against an isolated database.
 *
 * Full `prisma migrate deploy` from empty fails on this repo because older
 * migrations are out of chronological dependency order (pre-existing).
 * Production databases already have that history applied; deploy only runs
 * *pending* migrations.
 *
 * This script:
 * 1. Recreates bretunetech_migrate_check
 * 2. Applies the current Prisma schema via `db push` (coherence check)
 * 3. Verifies newsletter hardening tables/columns exist
 */
require('dotenv').config();
const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const u = process.env.DATABASE_URL;
  if (!u) throw new Error('DATABASE_URL missing');
  const admin = new URL(u);
  admin.pathname = '/postgres';
  const c = new Client({ connectionString: admin.toString() });
  await c.connect();
  const name = 'bretunetech_migrate_check';
  await c
    .query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [name],
    )
    .catch(() => undefined);
  await c.query(`DROP DATABASE IF EXISTS ${name}`);
  await c.query(`CREATE DATABASE ${name}`);
  console.log('recreated', name);
  await c.end();

  const testUrl = new URL(u);
  testUrl.pathname = `/${name}`;
  const url = testUrl.toString();
  fs.writeFileSync(path.join(__dirname, '.migrate-check-url'), url, 'utf8');

  console.log('prisma validate + db push (current schema coherence)…');
  execSync('npx prisma validate && npx prisma db push --accept-data-loss && npx prisma generate', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });

  const check = new Client({ connectionString: url });
  await check.connect();
  const required = [
    ['newsletter_recipients', 'firstDispatchedAt'],
    ['newsletter_pending_webhooks', null],
    ['newsletter_worker_locks', null],
    ['newsletter_rate_buckets', null],
    ['newsletter_webhook_receipts', null],
  ];
  for (const [table, column] of required) {
    const t = await check.query('SELECT to_regclass($1) AS r', [`public.${table}`]);
    if (!t.rows[0].r) throw new Error(`Missing table ${table}`);
    if (column) {
      const col = await check.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (!col.rowCount) throw new Error(`Missing column ${table}.${column}`);
    }
  }
  const enums = await check.query(
    `SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'NewsletterRecipientStatus'`,
  );
  const labels = enums.rows.map((r) => r.enumlabel);
  for (const need of ['DISPATCHING', 'AMBIGUOUS']) {
    if (!labels.includes(need)) throw new Error(`Missing enum value ${need}`);
  }
  await check.end();
  console.log('Newsletter schema validation OK against', name);
  console.log(
    'Note: greenfield `migrate deploy` is not used here due to legacy migration ordering; production applies pending migrations only.',
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
