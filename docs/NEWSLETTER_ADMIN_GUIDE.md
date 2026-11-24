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

## Test send (single recipient)

1. Ensure no **APPROVED** / **SCHEDULED** campaigns exist that you do not intend to release (revert them to **DRAFT** first).
2. Keep `NEWSLETTER_WORKER_ENABLED=false` during tests.
3. Open a **DRAFT** campaign → **Send test** → enter **one** authorized address.
4. Test delivery uses `X-Newsletter-Test` / force path and does **not** require bulk sending to be enabled.
5. Confirm rendering, links, logo/images, and unsubscribe before enabling the worker.

SMTP note: provider acceptance (`250` / message id) means the mailbox server accepted the message. It is **not** the same as inbox delivery, open, bounce, or complaint. Without Resend (or similar) webhooks, bounce/complaint automation is limited.

## Enabling email sending safely

Do this only after DNS (SPF/DKIM/DMARC), provider credentials, a successful controlled test send, and operator approval.

**Source of truth:** `backend/.env`. Production `ecosystem.config.js` does **not** pin newsletter flags (so PM2 cannot permanently override `.env`). Deploy scripts still **fail closed** if `.env` is not `false` at cutover.

1. Confirm `NEWSLETTER_PROVIDER=smtp` (or `resend`) with dedicated newsletter mailbox credentials (no silent sales@ fallback for bulk).
2. Set public URLs (recommended):

```env
NEWSLETTER_SITE_URL=https://bretunetech.com
NEWSLETTER_API_PUBLIC_URL=https://bretunetech.com/api
```

3. Set in `backend/.env` on the VPS (never commit):

```env
NEWSLETTER_SENDING_ENABLED=true
NEWSLETTER_WORKER_ENABLED=true
```

4. Restart **only** the backend with the dedicated Node 22 interpreter already configured:

```bash
pm2 restart bretunetech-backend --update-env
```

If PM2 still shows stale pinned flags from an older process definition, recreate from ecosystem (backend only):

```bash
pm2 delete bretunetech-backend
pm2 start ecosystem.config.js --only bretunetech-backend
```

5. Verify runtime (not only the file): dashboard `sendingEnabled` / `workerEnabled`, and that no unintended campaign is `SENDING`.
6. Approve a **small** campaign only when ready. Do not approve historical drafts by accident.

### Emergency stop

```env
NEWSLETTER_SENDING_ENABLED=false
NEWSLETTER_WORKER_ENABLED=false
```

Then `pm2 restart bretunetech-backend --update-env`. Cancel any `SCHEDULED`/`SENDING` campaigns in admin. Deploy scripts never auto-enable these flags.

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
