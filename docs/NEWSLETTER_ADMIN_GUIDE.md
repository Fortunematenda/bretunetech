# BretuneTech Newsletter Admin Guide

Operator handbook for the Email Campaigns admin area (`/admin/newsletters`).  
Bulk marketing send stays **off** until you deliberately enable it after review.

## Permissions

Assign via admin roles:

| Permission | Allows |
|------------|--------|
| `marketing.newsletters.view` | Dashboard, campaigns, templates, calendar, analytics |
| `marketing.newsletters.edit` | Create/edit drafts, templates, cancel, schedule settings |
| `marketing.newsletters.send` | Approve, schedule send time, start send, test email |
| `marketing.newsletters.subscribers` | Subscriber list, import/export, consent audit |

`SUPER_ADMIN` receives all permissions after `npx ts-node --transpile-only src/seed-permissions.ts`.

## Managing subscribers

1. Open **Email Campaigns → Subscribers**.
2. Search by email or name; filter by status, consent eligibility, source, interest, and purchase activity.
3. **Eligible** = `ACTIVE` + confirmed + not `customer-account` legacy auto-enrol.
4. **Needs consent** = legacy `customer-account` rows. They stay in the database but are **excluded from campaigns** until they re-subscribe with marketing consent (double opt-in) or are imported with documented consent.
5. Suppression reasons appear when a bounce/complaint/unsubscribe suppressed the address — do not remove suppressions casually.
6. **Export CSV** downloads the current filter (max page size from API).
7. **Import CSV** columns: `email,firstName,consentAt,source,interests`. Preview validates before confirm. Suppressed / unsubscribed rows are skipped.

## Creating newsletters

1. **Templates** → preview → **Use for campaign** (creates a `DRAFT`), or **Campaigns → New draft**.
2. Edit title, subject, preview text, and blocks in the visual editor (or Advanced JSON).
3. Use desktop/mobile preview. The branded header and unsubscribe footer are part of the generated email.
4. Save often. Editing approved/scheduled content returns the campaign to `DRAFT` and clears approval.
5. **SENT campaigns are immutable.** Duplicate to create a new draft if you need to resend.

### Block types

Eyebrow, Hero (+ image), Feature cards, Text, Category, Products, Services, CTA, Divider, Spacer, Contact, Offer, Project.

Unsafe HTML in rich text is stripped server-side before send/render.

## Templates

Seed or refresh defaults:

```bash
cd backend
npm run newsletter:seed-templates
```

Includes monthly, CCTV, Wi-Fi, promotions, IT solutions, cabling, backup connectivity, and seasonal layouts. Editing a template does not change past campaigns.

## December 2026 draft

```bash
cd backend
npm run newsletter:seed-december
```

Creates/updates month key `2026-12`, title **Stay Connected. Stay Protected.**, status **DRAFT** only. No send.

## Approval, audience, scheduling (Africa/Johannesburg)

1. **Submit for approval** (`DRAFT` → `PENDING_APPROVAL`).
2. Reviewer with send permission: check **audience preview** (eligible count vs legacy excluded / suppressed).
3. **Approve**, then either:
   - **Schedule** a future Johannesburg-local datetime, or
   - **Start send** only when `NEWSLETTER_SENDING_ENABLED=true` and the provider is configured.
4. **Cancel** is allowed through `SENDING`; remaining unsent recipients become `SKIPPED`.

Automatic monthly automation (`Automations`) creates **drafts only** — it never sends without approval.

## Analytics

- **Analytics** page: global accepted vs delivered, opens/clicks, failures, ambiguous.
- Per-campaign report: `/admin/newsletters/campaigns/[id]/analytics` with optional date range and CSV export.
- **Accepted** = provider accepted the message. **Delivered** = webhook-confirmed inbox delivery (may be unavailable without Resend webhooks).

## Enabling email sending safely

Do this only after DNS (SPF/DKIM/DMARC), provider credentials, webhook, and a successful test send.

1. Confirm `NEWSLETTER_PROVIDER` is `resend` or `smtp` with dedicated newsletter mailbox credentials (no silent sales@ fallback).
2. Set in `backend/.env` on the VPS (never commit):

```env
NEWSLETTER_SENDING_ENABLED=true
NEWSLETTER_WORKER_ENABLED=true
```

3. `pm2 restart bretunetech-backend --update-env`
4. Approve a small campaign, schedule or start, watch recipient statuses and Resend dashboard.
5. To pause: set both flags to `false` and restart the backend. Deploy scripts **do not** turn these flags on.

## Environment variables

See also `docs/NEWSLETTER_SETUP.md`. Required for production readiness:

| Variable | Purpose |
|----------|---------|
| `NEWSLETTER_SENDING_ENABLED` | Master bulk-send gate (`true` to allow) |
| `NEWSLETTER_WORKER_ENABLED` | In-process queue tick |
| `NEWSLETTER_PROVIDER` | `resend`, `smtp`, or `mock` (staging only) |
| `MAIL_MOCK` | `1` on staging — blocks transactional SMTP |
| `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` | When provider=resend |
| `NEWSLETTER_SMTP_*` | When provider=smtp |
| `NEWSLETTER_FROM_EMAIL` / `NEWSLETTER_FROM_NAME` | From identity |
| `NEWSLETTER_SITE_URL` / `NEWSLETTER_API_PUBLIC_URL` | Links + tracking |
| `NEWSLETTER_TOKEN_SECRET` | Unsubscribe / tracking signatures |
| `NEWSLETTER_DOUBLE_OPT_IN` | Default on |

## Deployment checklist

1. [ ] Backup DB: `bash scripts/newsletter-db-backup.sh`
2. [ ] Validate current schema on an isolated DB: `cd backend && node scripts/validate-migrations-local.js` (or `bash scripts/validate-newsletter-migrations.sh --docker`)
3. [ ] Confirm pending migrations only (production already has history): `cd backend && npx prisma migrate status`
4. [ ] Merge/release to `main` only when draft PR review is complete
5. [ ] Deploy via existing GitHub Action / `scripts/deploy-production.sh` (runs `pg_dump` + `prisma migrate deploy` before PM2 restart; aborts on migrate failure)
6. [ ] Confirm deploy logs: “Newsletter bulk sending remains off” unless you already enabled flags
7. [ ] `npm run newsletter:seed-templates` (runs on backend deploy)
8. [ ] Optionally `npm run newsletter:seed-december` for the December draft
9. [ ] Smoke: admin dashboard loads; public subscribe/unsubscribe pages load
10. [ ] Do **not** set `NEWSLETTER_SENDING_ENABLED=true` until a human signs off

**Note:** Replaying *all* Prisma migrations from an empty database fails due to older out-of-order migrations (unrelated to newsletter). Production VPS databases are already baselined; deploy only applies **pending** additive migrations.

### Migration failure procedure

1. Deploy aborts before PM2 restart; runtime artifacts roll back via existing trap.
2. Database dump is at `/var/backups/bretunetech/<deploy>/database.dump`.
3. Inspect Prisma error; fix forward with a new additive migration if needed.
4. Restore only if necessary:  
   `pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" /path/to/database.dump`
5. Additive migrations already applied are compatible with rolled-back Node `dist` (older code ignores new columns/enums).

### Runtime rollback note

`deploy-production.sh` restores `node_modules` / `dist` / `.next` only. It does **not** reverse SQL. Keep newsletter migrations additive (`ADD COLUMN`, `ADD VALUE`, new tables).

## Playwright e2e

```bash
cd frontend
set NEWSLETTER_E2E=1
set E2E_BASE_URL=http://127.0.0.1:3000
set E2E_API_URL=http://127.0.0.1:4000
set E2E_ADMIN_EMAIL=...
set E2E_ADMIN_PASSWORD=...
npm run test:newsletter-e2e
```

Screenshots land in `frontend/test-results/screenshots/` (gitignored). Suite skips cleanly when `NEWSLETTER_E2E` is unset.
