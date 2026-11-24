/**
 * Verify newsletter *pending* migrations against an isolated DB with a
 * representative pre-upgrade schema + synthetic data, then backup/restore.
 *
 * Does NOT touch production. Does NOT rewrite historical migrations.
 *
 *   node backend/scripts/verify-pending-newsletter-migrations.js --docker
 */
'use strict';

const { Client } = require('pg');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const MIGRATIONS_DIR = path.join(ROOT, 'prisma', 'migrations');
const PENDING = new Set([
  '20261124120000_newsletter_hardening',
  '20261124140000_newsletter_crash_recovery',
  '20261124160000_newsletter_first_dispatched',
]);

const REVERSE_HARDENING_SQL = `
DROP INDEX IF EXISTS "newsletter_recipients_campaign_status_next_idx";
ALTER TABLE "newsletter_recipients"
  DROP COLUMN IF EXISTS "nextAttemptAt",
  DROP COLUMN IF EXISTS "claimedAt",
  DROP COLUMN IF EXISTS "claimToken",
  DROP COLUMN IF EXISTS "firstDispatchedAt";
ALTER TABLE "newsletter_campaigns"
  DROP COLUMN IF EXISTS "cancelledAt",
  DROP COLUMN IF EXISTS "cancelledById";
DROP INDEX IF EXISTS "newsletter_events_provider_event_id_key";
ALTER TABLE "newsletter_events"
  DROP COLUMN IF EXISTS "providerEventId";
DROP TABLE IF EXISTS "newsletter_webhook_receipts";
DROP TABLE IF EXISTS "newsletter_pending_webhooks";
DROP TABLE IF EXISTS "newsletter_worker_locks";
DROP TABLE IF EXISTS "newsletter_rate_buckets";
`;

function sh(cmd, env = {}) {
  execSync(cmd, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: true,
  });
}

/** Strip Prisma-only query params (e.g. schema=) that libpq/pg_dump reject. */
function pgConnectionUrl(url) {
  const u = new URL(url);
  u.searchParams.delete('schema');
  return u.toString();
}

function resolvePgBin(name) {
  const fromPath = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], {
    encoding: 'utf8',
    shell: true,
  });
  if (fromPath.status === 0 && fromPath.stdout.trim()) {
    return fromPath.stdout.trim().split(/\r?\n/)[0];
  }
  if (process.platform === 'win32') {
    const candidates = [
      `C:\\Program Files\\PostgreSQL\\17\\bin\\${name}.exe`,
      `C:\\Program Files\\PostgreSQL\\16\\bin\\${name}.exe`,
      `C:\\Program Files\\PostgreSQL\\15\\bin\\${name}.exe`,
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return name;
}

function listMigrations() {
  return fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(MIGRATIONS_DIR, d.name, 'migration.sql')))
    .map((d) => d.name)
    .sort();
}

async function adminClientFrom(url) {
  const u = new URL(url);
  u.pathname = '/postgres';
  const c = new Client({ connectionString: u.toString() });
  await c.connect();
  return c;
}

async function recreateDb(adminUrl, name) {
  const c = await adminClientFrom(adminUrl);
  await c
    .query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [name],
    )
    .catch(() => undefined);
  await c.query(`DROP DATABASE IF EXISTS "${name}"`);
  await c.query(`CREATE DATABASE "${name}"`);
  await c.end();
  const u = new URL(adminUrl);
  u.pathname = `/${name}`;
  return u.toString();
}

async function main() {
  const useDocker = process.argv.includes('--docker');
  let containerId = null;
  let adminUrl = process.env.DATABASE_URL;

  try {
    if (useDocker) {
      const run = spawnSync(
        'docker',
        [
          'run',
          '-d',
          '--rm',
          '-e',
          'POSTGRES_PASSWORD=postgres',
          '-e',
          'POSTGRES_DB=postgres',
          '-p',
          '55433:5432',
          'postgres:16-alpine',
        ],
        { encoding: 'utf8' },
      );
      if (run.status !== 0) throw new Error(run.stderr || 'docker run failed');
      containerId = run.stdout.trim();
      console.log('Started ephemeral Postgres', containerId);
      adminUrl = 'postgresql://postgres:postgres@127.0.0.1:55433/postgres';
      for (let i = 0; i < 60; i++) {
        const ready = spawnSync('docker', ['exec', containerId, 'pg_isready', '-U', 'postgres'], {
          encoding: 'utf8',
        });
        if (ready.status === 0) break;
        await new Promise((r) => setTimeout(r, 500));
        if (i === 59) throw new Error('Postgres not ready');
      }
    }

    if (!adminUrl) throw new Error('DATABASE_URL required (or pass --docker)');

    const greenfieldUrl = await recreateDb(adminUrl, 'bretunetech_greenfield_fail');
    console.log('\n--- Expected greenfield migrate deploy failure (legacy out-of-order) ---');
    const gf = spawnSync('npx prisma migrate deploy', {
      cwd: ROOT,
      env: { ...process.env, DATABASE_URL: greenfieldUrl },
      encoding: 'utf8',
      shell: true,
    });
    if (gf.status === 0) {
      console.warn('WARNING: greenfield migrate deploy unexpectedly succeeded');
    } else {
      console.log('Greenfield migrate deploy failed as expected (exit', gf.status, ')');
      const combined = `${gf.stdout || ''}\n${gf.stderr || ''}`;
      if (/P3018|admin_notification_states/i.test(combined)) {
        console.log('Confirmed: failure involves P3018 / admin_notification_states ordering.');
      } else {
        console.log((gf.stderr || gf.stdout || '').slice(0, 800));
      }
    }

    const dbUrl = await recreateDb(adminUrl, 'bretunetech_pending_check');
    console.log('\n--- Build representative pre-upgrade schema ---');
    sh('npx prisma validate && npx prisma db push --accept-data-loss && npx prisma generate', {
      DATABASE_URL: dbUrl,
    });

    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    await client.query(REVERSE_HARDENING_SQL);

    // Mark historical migrations applied with Prisma's own checksum via migrate resolve
    await client.end();
    for (const name of listMigrations()) {
      if (PENDING.has(name)) continue;
      sh(`npx prisma migrate resolve --applied "${name}"`, { DATABASE_URL: dbUrl });
    }

    const seed = new Client({ connectionString: dbUrl });
    await seed.connect();
    const subId = crypto.randomUUID();
    const campaignId = crypto.randomUUID();
    await seed.query(
      `INSERT INTO newsletter_subscribers
        (id, email, status, source, "consentText", "consentAt", "createdAt", "updatedAt")
       VALUES ($1, $2, 'ACTIVE', 'pending-migrate-test', 'synthetic consent', NOW(), NOW(), NOW())`,
      [subId, 'synthetic-pending@example.com'],
    );
    await seed.query(
      `INSERT INTO newsletter_campaigns
        (id, title, subject, "previewText", "fromName", "fromEmail", audience, status, blocks, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, '', 'BretuneTech', 'newsletter@bretunetech.com', '{"all":true}'::jsonb, 'DRAFT', '[]'::jsonb, NOW(), NOW())`,
      [campaignId, 'Pre-upgrade synthetic campaign', 'Synthetic subject'],
    );

    const pre = await seed.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'newsletter_recipients' AND column_name = 'firstDispatchedAt'`,
    );
    if (pre.rowCount) throw new Error('pre-upgrade reverse failed: firstDispatchedAt still present');
    const preTable = await seed.query(`SELECT to_regclass('public.newsletter_webhook_receipts') AS r`);
    if (preTable.rows[0].r) throw new Error('pre-upgrade reverse failed: webhook_receipts still present');
    await seed.end();

    console.log('\n--- Apply pending migrations only (prisma migrate deploy) ---');
    sh('npx prisma migrate deploy', { DATABASE_URL: dbUrl });

    const verify = new Client({ connectionString: dbUrl });
    await verify.connect();
    for (const [table, column] of [
      ['newsletter_recipients', 'firstDispatchedAt'],
      ['newsletter_recipients', 'claimToken'],
      ['newsletter_pending_webhooks', null],
      ['newsletter_worker_locks', null],
      ['newsletter_rate_buckets', null],
      ['newsletter_webhook_receipts', null],
    ]) {
      const t = await verify.query('SELECT to_regclass($1) AS r', [`public.${table}`]);
      if (!t.rows[0].r) throw new Error(`Missing table ${table}`);
      if (column) {
        const col = await verify.query(
          `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
          [table, column],
        );
        if (!col.rowCount) throw new Error(`Missing column ${table}.${column}`);
      }
    }
    const applied = await verify.query(
      `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = ANY($1::text[]) ORDER BY 1`,
      [[...PENDING]],
    );
    if (applied.rowCount !== PENDING.size) {
      throw new Error(`Expected ${PENDING.size} pending migrations applied, got ${applied.rowCount}`);
    }
    const still = await verify.query(`SELECT email FROM newsletter_subscribers WHERE email = $1`, [
      'synthetic-pending@example.com',
    ]);
    if (!still.rowCount) throw new Error('Synthetic subscriber lost during pending migrate');
    console.log('Synthetic subscriber survived pending migrate');
    await verify.end();

    console.log('\n--- Backup / restore against isolated DB ---');
    const dumpDir = path.join(ROOT, 'scripts', '.tmp-migrate-verify');
    fs.mkdirSync(dumpDir, { recursive: true });
    const dumpFile = path.join(dumpDir, 'pending-check.dump');

    if (containerId) {
      const dump = spawnSync(
        'docker',
        [
          'exec',
          containerId,
          'pg_dump',
          '-U',
          'postgres',
          '-Fc',
          '-d',
          'bretunetech_pending_check',
          '-f',
          '/tmp/pending-check.dump',
        ],
        { encoding: 'utf8' },
      );
      if (dump.status !== 0) throw new Error(dump.stderr || 'pg_dump failed');
      spawnSync('docker', ['cp', `${containerId}:/tmp/pending-check.dump`, dumpFile], { stdio: 'inherit' });
    } else {
      const pgDump = resolvePgBin('pg_dump');
      const dump = spawnSync(
        pgDump,
        ['--format=custom', '--no-owner', '--no-acl', `--dbname=${pgConnectionUrl(dbUrl)}`, `--file=${dumpFile}`],
        { encoding: 'utf8', shell: false },
      );
      if (dump.status !== 0 || !fs.existsSync(dumpFile)) {
        throw new Error(dump.stderr || `pg_dump failed (${pgDump}) — install client tools or use --docker`);
      }
    }

    await recreateDb(adminUrl, 'bretunetech_restore_check');
    if (containerId) {
      spawnSync('docker', ['cp', dumpFile, `${containerId}:/tmp/pending-check.dump`], { stdio: 'inherit' });
      const r = spawnSync(
        'docker',
        [
          'exec',
          containerId,
          'pg_restore',
          '-U',
          'postgres',
          '-d',
          'bretunetech_restore_check',
          '--no-owner',
          '--no-acl',
          '/tmp/pending-check.dump',
        ],
        { encoding: 'utf8' },
      );
      console.log('pg_restore exit', r.status);
    } else {
      const pgRestore = resolvePgBin('pg_restore');
      const restoreTarget = new URL(adminUrl);
      restoreTarget.pathname = '/bretunetech_restore_check';
      const restore = spawnSync(
        pgRestore,
        ['--no-owner', '--no-acl', `--dbname=${pgConnectionUrl(restoreTarget.toString())}`, dumpFile],
        { encoding: 'utf8', shell: false },
      );
      console.log('pg_restore exit', restore.status);
      if (restore.status !== 0 && restore.status !== 1) {
        throw new Error(restore.stderr || 'pg_restore failed');
      }
    }

    const restoreUrl = new URL(adminUrl);
    restoreUrl.pathname = '/bretunetech_restore_check';
    const rest = new Client({ connectionString: restoreUrl.toString() });
    await rest.connect();
    const ok = await rest.query(`SELECT to_regclass('public.newsletter_webhook_receipts') AS r`);
    if (!ok.rows[0].r) throw new Error('Restore missing newsletter_webhook_receipts');
    const sub = await rest.query(`SELECT 1 FROM newsletter_subscribers WHERE email = $1`, [
      'synthetic-pending@example.com',
    ]);
    if (!sub.rowCount) throw new Error('Restore missing synthetic subscriber');
    await rest.end();
    console.log('\nPending migration path + backup/restore: OK');
  } finally {
    if (containerId) {
      spawnSync('docker', ['rm', '-f', containerId], { stdio: 'ignore' });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
