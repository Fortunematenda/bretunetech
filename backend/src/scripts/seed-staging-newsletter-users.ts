/**
 * Create synthetic staging admin + restricted test user.
 * Credentials MUST come from env — never hardcode secrets in the repo.
 *
 *   STAGING_ADMIN_EMAIL / STAGING_ADMIN_PASSWORD
 *   STAGING_RESTRICTED_EMAIL / STAGING_RESTRICTED_PASSWORD
 *
 * Run: npx ts-node --transpile-only src/scripts/seed-staging-newsletter-users.ts
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

async function ensureUser(opts: {
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  firstName: string;
  lastName: string;
}) {
  const hash = await bcrypt.hash(opts.password, 12);
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash: hash, isVerified: true, role: opts.role, firstName: opts.firstName, lastName: opts.lastName },
    });
    console.log('updated', opts.email, opts.role);
    return existing.id;
  }
  const created = await prisma.user.create({
    data: {
      email: opts.email,
      passwordHash: hash,
      isVerified: true,
      role: opts.role,
      firstName: opts.firstName,
      lastName: opts.lastName,
    },
  });
  console.log('created', opts.email, opts.role);
  return created.id;
}

async function main() {
  const url = new URL(process.env.DATABASE_URL || '');
  if (url.pathname !== '/bretunetech_staging' || decodeURIComponent(url.username) !== 'bretune_staging' || url.hostname !== '127.0.0.1' || process.env.MAIL_MOCK !== '1' || process.env.NEWSLETTER_PROVIDER !== 'mock') throw new Error('Refusing to seed outside isolated mock staging');
  const adminEmail = process.env.STAGING_ADMIN_EMAIL;
  const adminPassword = process.env.STAGING_ADMIN_PASSWORD;
  const restrictedEmail = process.env.STAGING_RESTRICTED_EMAIL;
  const restrictedPassword = process.env.STAGING_RESTRICTED_PASSWORD;

  if (!adminEmail || !adminPassword || !restrictedEmail || !restrictedPassword) {
    throw new Error(
      'Set STAGING_ADMIN_EMAIL, STAGING_ADMIN_PASSWORD, STAGING_RESTRICTED_EMAIL, STAGING_RESTRICTED_PASSWORD',
    );
  }
  if (adminPassword.length < 12 || restrictedPassword.length < 12) {
    throw new Error('Staging passwords must be at least 12 characters');
  }

  await ensureUser({
    email: adminEmail,
    password: adminPassword,
    role: 'SUPER_ADMIN',
    firstName: 'Staging',
    lastName: 'Admin',
  });

  await ensureUser({
    email: restrictedEmail,
    password: restrictedPassword,
    role: 'CUSTOMER',
    firstName: 'Staging',
    lastName: 'Restricted',
  });

  console.log('Staging users ready (credentials not printed).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
