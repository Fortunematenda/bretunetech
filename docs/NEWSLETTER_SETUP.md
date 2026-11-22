# BretuneTech Newsletter & Campaign Manager

## Architecture

- **Database:** PostgreSQL via Prisma (`newsletter_*` tables). Migration: `backend/prisma/migrations/20261121080000_newsletter_campaign_manager/`.
- **API:** `backend/src/modules/newsletter/` mounted at `/api/newsletter`.
- **Bulk provider:** [Resend](https://resend.com) (recommended). Transactional confirmations and admin test sends can use existing SMTP (`backend/src/lib/mailer.ts`) when Resend is not configured.
- **Queue:** In-process worker in `server.ts` (one batch per minute when enabled). Not a separate worker process.
- **Sending is off by default** until you explicitly enable it.

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

# Provider: resend (bulk) or smtp (mailbox on domains.co.za / your host)
NEWSLETTER_PROVIDER=smtp
NEWSLETTER_SMTP_USER=newsletter@bretunetech.com
NEWSLETTER_SMTP_PASS=your-mailbox-password
# Optional overrides (default to SMTP_HOST / SMTP_PORT)
# NEWSLETTER_SMTP_HOST=cp69.domains.co.za
# NEWSLETTER_SMTP_PORT=465

# Or Resend for large bulk:
# NEWSLETTER_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_WEBHOOK_SECRET=your-webhook-signing-secret

# Token signing for one-click unsubscribe links
NEWSLETTER_TOKEN_SECRET=long-random-string

# Throttling
NEWSLETTER_BATCH_SIZE=25
NEWSLETTER_RATE_PER_MINUTE=60
NEWSLETTER_MAX_ATTEMPTS=3
```

## Resend setup

1. Create a Resend account and verify your sending domain.
2. Add DNS records (Resend dashboard → Domains):
   - **SPF:** include Resend’s SPF target on your domain.
   - **DKIM:** CNAME records Resend provides.
   - **DMARC:** `v=DMARC1; p=none; rua=mailto:dmarc@bretunetech.com` (tighten to `quarantine`/`reject` after monitoring).
3. Create an API key with “Sending access”.
4. Configure webhook: `POST https://bretunetech.com/api/newsletter/webhooks/resend` for `email.delivered`, `email.bounced`, `email.complained`.
5. Set `RESEND_WEBHOOK_SECRET` to the signing secret Resend shows (matched against `x-resend-signature` header in this implementation).

## Permissions

Run after deploy/migrate:

```bash
cd backend && npm run seed -- # or ts-node seed-permissions only if you have a dedicated script
npx ts-node --transpile-only src/seed-permissions.ts
```

Permissions: `marketing.newsletters.view`, `.edit`, `.send`, `.subscribers`.

## Database

```bash
cd backend
npx prisma migrate deploy   # production
# or npx prisma migrate dev  # local
npx prisma generate
```

## Sample December draft

```bash
cd backend && npm run newsletter:seed-december
```

Creates `monthKey=2025-12`, status `DRAFT`, does **not** send.

## Starter templates (editable)

```bash
cd backend
npx prisma migrate deploy   # includes newsletter_templates metadata
npm run newsletter:seed-templates
```

Seeds six layouts (monthly catalogue, networking, CCTV, product spotlight, services, announcement). In admin:

- **Marketing → Newsletters → Templates** — edit name, subject, and blocks.
- **Use for campaign** — copies the template into a new draft you can edit before send.

Re-running the seed updates names/descriptions for known slugs but **does not** overwrite blocks you already edited.

## Scheduler (monthly draft)

Admin → **Marketing → Newsletters → Schedule** (API: `PUT /api/newsletter/admin/schedule`).

- `enabled: false` by default.
- When enabled, the worker creates **one draft per calendar month** (`monthKey` `YYYY-MM`) and requires admin approval before send.
- Duplicate monthly sends are prevented by unique `monthKey`.

## Enable live sending (only after approval)

1. Verify DNS, test send from admin UI.
2. Set `NEWSLETTER_SENDING_ENABLED=true`
3. Set `NEWSLETTER_WORKER_ENABLED=true`
4. Restart `bretunetech-backend` PM2 app only.

## POPIA / consent

- Website signup requires **explicit unchecked** marketing opt-in (frontend).
- Double opt-in defaults **on** (`NEWSLETTER_DOUBLE_OPT_IN=true`).
- Do **not** bulk-import existing customers without documented consent (`consentAt`, `source` on import).
- Suppression list honours unsubscribes, bounces and complaints.

## Open / click analytics

- Opens use a tracking pixel (`/api/newsletter/track/open/:id.png`) — rates are **approximate** (Apple Mail Privacy, image blocking).
- Clicks redirect via `/api/newsletter/track/click/:id?url=...`.
- Dashboard metrics are computed from `newsletter_events` only (no mock figures).