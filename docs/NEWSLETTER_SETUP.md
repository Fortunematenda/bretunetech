# BretuneTech Newsletter & Campaign Manager

## Architecture

- **Database:** PostgreSQL via Prisma (`newsletter_*` tables).
  Migrations include `20261121080000_newsletter_campaign_manager`, `20261122080000_newsletter_template_metadata`, `20261124120000_newsletter_hardening`, `20261124140000_newsletter_crash_recovery`, `20261124160000_newsletter_first_dispatched`.
- **API:** `backend/src/modules/newsletter/` at `/api/newsletter`.
- **Bulk provider:** Resend (recommended) or dedicated newsletter SMTP. Misconfigured providers **fail closed** (no silent transactional `sales@` fallback for campaign sends).
- **Queue:** In-process worker in `server.ts` when `NEWSLETTER_WORKER_ENABLED=true`.
- **Default is off.** Deploy never sets `NEWSLETTER_SENDING_ENABLED` / `NEWSLETTER_WORKER_ENABLED` to true. Operators enable flags manually after review.

## Environment variables

Add to `backend/.env` (never commit secrets):

```env
# Feature flags (default: off)
NEWSLETTER_SENDING_ENABLED=false
NEWSLETTER_WORKER_ENABLED=false
NEWSLETTER_DOUBLE_OPT_IN=true

# Public URLs used in links and tracking
NEWSLETTER_SITE_URL=https://bretunetech.com
NEWSLETTER_API_PUBLIC_URL=https://bretunetech.com/api

# Sender identity
NEWSLETTER_FROM_NAME=BretuneTech
NEWSLETTER_FROM_EMAIL=newsletter@bretunetech.com

# Provider: resend (bulk) or smtp (dedicated mailbox)
NEWSLETTER_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Or dedicated SMTP (all three required — no shared-mailer fallback):
# NEWSLETTER_PROVIDER=smtp
# NEWSLETTER_SMTP_HOST=cp69.domains.co.za
# NEWSLETTER_SMTP_PORT=465
# NEWSLETTER_SMTP_USER=newsletter@bretunetech.com
# NEWSLETTER_SMTP_PASS=your-mailbox-password

NEWSLETTER_TOKEN_SECRET=long-random-string
NEWSLETTER_BATCH_SIZE=25
NEWSLETTER_RATE_PER_MINUTE=60
NEWSLETTER_MAX_ATTEMPTS=3
```

## Resend setup

1. Verify sending domain; add SPF, DKIM, DMARC.
2. API key with sending access.
3. Webhook `POST https://bretunetech.com/api/newsletter/webhooks/resend` for `email.delivered`, `email.bounced`, `email.complained` (Svix signature).
4. Idempotency keys are retained ~24h; after that window crash recovery marks recipients `AMBIGUOUS` for manual reconciliation.

## Permissions

```bash
cd backend && npx ts-node --transpile-only src/seed-permissions.ts
```

Permissions: `marketing.newsletters.view` | `.edit` | `.send` | `.subscribers`.

## Database

```bash
cd backend
npx prisma migrate deploy   # production / CI
npx prisma generate
```

Validate on an isolated empty database before production:

```bash
bash scripts/validate-newsletter-migrations.sh --docker
# or DATABASE_URL=postgresql://.../empty_db bash scripts/validate-newsletter-migrations.sh
```

Backup before deploy migrate:

```bash
bash scripts/newsletter-db-backup.sh /var/backups/bretunetech/db
```

Production deploy (`scripts/deploy-production.sh`) runs `pg_dump` then `prisma migrate deploy` and **aborts** if migrate fails (before PM2 restart).

## Seeds

```bash
npm run newsletter:seed-templates
npm run newsletter:seed-december   # DRAFT only — Stay Connected. Stay Protected.
npm run newsletter:audit-consent   # dry-run legacy consent counts
```

## Operator guide

See [NEWSLETTER_ADMIN_GUIDE.md](./NEWSLETTER_ADMIN_GUIDE.md) for day-to-day admin workflows, scheduling timezone (Africa/Johannesburg), analytics, and the send enablement checklist.

## Consent

- Public subscribe requires marketing consent + double opt-in by default.
- Legacy `customer-account` auto-enrolled rows are preserved but excluded from audiences until fresh consent (subscribe/import). Suppressions are always respected.
