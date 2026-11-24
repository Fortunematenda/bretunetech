# BretuneTech Newsletter & Campaign Manager

## Architecture

- **Database:** PostgreSQL via Prisma (`newsletter_*` tables). Migrations: `20261121080000_newsletter_campaign_manager`, `20261122080000_newsletter_template_metadata`, `20261124120000_newsletter_hardening`.
- **API:** `backend/src/modules/newsletter/` mounted at `/api/newsletter`.
- **Bulk provider:** [Resend](https://resend.com) (recommended). Transactional confirmations and admin test sends can use existing SMTP (`backend/src/lib/mailer.ts`) when Resend is not configured.
- **Queue:** In-process worker in `server.ts` (one batch per minute when enabled). Not a separate worker process.
- **Local default is off.** Production deploys set `NEWSLETTER_SENDING_ENABLED` and `NEWSLETTER_WORKER_ENABLED` to `true` in the server `.env` and restart only `bretunetech-backend`. The worker sends a campaign only after an admin approves it and starts sending.

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

## Live sending

Production deploy turns both flags on. Mail still waits for an approved campaign and **Start sending** in admin. A test send does not require the bulk flag.

## POPIA / consent

- Registered shop customers and marketing subscribers are separate. Verifying a customer account only **links** `userId` when that email is already an ACTIVE marketing subscriber.
- `npm run newsletter:enroll-customers` no longer activates anyone; it only links accounts to existing ACTIVE rows.
- Website footer signup requires explicit marketing consent. Double opt-in defaults **on** (`NEWSLETTER_DOUBLE_OPT_IN=true`). Pending rows stay PENDING until confirm.
- Do **not** bulk-import without documented consent (`consentAt`, `source`). Import skips suppressed and previously unsubscribed addresses.
- Unsubscribe is transactional and idempotent. Hard bounces and complaints suppress the address automatically.
- Approved/scheduled content edits revert the campaign to DRAFT and clear approval. Use `POST /admin/campaigns/:id/schedule` and `/cancel`.
- Worker claim uses `FOR UPDATE SKIP LOCKED`, rate limits, exponential backoff, and signed tracking / one-click unsubscribe links.
- Resend webhooks require Svix signature verification against the raw body (`RESEND_WEBHOOK_SECRET`).

## Open / click analytics

- Opens use a tracking pixel (`/api/newsletter/track/open/:id.png`) — rates are **approximate** (Apple Mail Privacy, image blocking).
- Clicks redirect via `/api/newsletter/track/click/:id?url=...`.
- Dashboard metrics are computed from `newsletter_events` only (no mock figures).