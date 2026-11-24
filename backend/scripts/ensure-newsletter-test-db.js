require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const u = process.env.DATABASE_URL;
  if (!u) throw new Error('DATABASE_URL missing');
  const admin = new URL(u);
  admin.pathname = '/postgres';
  const c = new Client({ connectionString: admin.toString() });
  await c.connect();
  const r = await c.query("SELECT 1 FROM pg_database WHERE datname = 'bretunetech_newsletter_test'");
  if (!r.rowCount) {
    await c.query('CREATE DATABASE bretunetech_newsletter_test');
    console.log('created bretunetech_newsletter_test');
  } else {
    console.log('bretunetech_newsletter_test exists');
  }
  await c.end();

  const testUrl = new URL(u);
  testUrl.pathname = '/bretunetech_newsletter_test';
  console.log(testUrl.toString().replace(/:[^:@/]+@/, ':****@'));
  process.stdout.write('TEST_DATABASE_URL_SET\n');
  // Write for subsequent shell use via env file fragment
  require('fs').writeFileSync(
    require('path').join(__dirname, '.newsletter-test-db-url'),
    testUrl.toString(),
    'utf8',
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
