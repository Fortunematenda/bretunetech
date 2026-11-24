# Staging deployment plan (approval required before VPS changes)

**Status:** awaiting operator approval. No staging directories, databases, nginx sites, or PM2 apps have been created on the VPS from this workstream.

**Phase 1 note (this agent session):** BatchMode SSH to `root@161.97.120.107` failed (`FATAL ERROR: Cannot answer interactive prompts in batch mode` — no Pageant/key available). Run `scripts/staging-vps-assess.sh` from an authenticated shell and paste the output before approving apply.

## Goals

- Isolated staging for newsletter authenticated browser testing
- Zero connection to the live production PostgreSQL database
- Zero real email delivery (mocked providers)
- Production PM2 apps (`bretunetech-backend` / `bretunetech-frontend`) untouched

## Proposed layout

| Resource | Value |
|---|---|
| App directory | `/var/www/bretunetech-staging` |
| Frontend port | `3015` (3005 occupied by Forgejo) |
| Backend port | `4005` (fallback `4015` if occupied) |
| Database | `bretunetech_staging` |
| DB user | `bretune_staging` (own password; no prod grants) |
| PM2 apps | `bretunetech-staging-backend`, `bretunetech-staging-frontend` |
| Hostnames | `staging.bretunetech.com`, `staging-api.bretunetech.com` |
| Mail | `NEWSLETTER_PROVIDER=mock` + `MAIL_MOCK=1` |
| Send flags | `NEWSLETTER_SENDING_ENABLED=false`, `NEWSLETTER_WORKER_ENABLED=false` |

Repo artifacts:

- `scripts/staging-vps-assess.sh` — read-only host probe
- `ecosystem.staging.config.js`
- `deploy/nginx/staging.bretunetech.com.conf`
- `deploy/staging/*.env.example`
- `scripts/deploy-staging.sh` — applies only after approval

## Phase 0 — read-only assessment (operator)

SSH to the VPS and run:

```bash
bash /path/to/staging-vps-assess.sh
# or pipe from laptop after scp
```

Capture: CPU/RAM/disk, Postgres + `pg_dump` versions, PM2 list, listening ports (`3015`/`4005`), nginx sites, whether `/var/www/bretunetech-staging` exists, production newsletter flags.

**Do not** restart production PM2 apps.

## Steps after approval (summary)

1. DNS A records for staging hostnames → VPS IP
2. Create Postgres role + database `bretunetech_staging` (no prod DB privileges)
3. `git clone` / checkout `feature/newsletter-hardening` into `/var/www/bretunetech-staging`
4. Copy env examples; generate unique JWT / newsletter token secrets
5. Install, `prisma generate`, apply schema safely (pending migrate on empty staging via `db push` or validated path — never against prod)
6. Seed permissions + staging admin / restricted test users (synthetic credentials)
7. Build backend + frontend; `pm2 start ecosystem.staging.config.js`
8. Install nginx staging vhosts; `nginx -t`; reload nginx (not restart unless needed)
9. Certbot for both hostnames
10. Basic auth + `X-Robots-Tag: noindex` + `robots.txt` Disallow
11. Smoke: health, admin login, newsletter dashboard
12. Playwright with `NEWSLETTER_E2E=1` against staging URLs

## Explicit non-goals

- No production deploy / merge of PR #2
- No enabling production send/worker flags
- No real Resend/SMTP traffic from staging
- No credentials committed to git

## Rollback (staging only)

```bash
pm2 stop bretunetech-staging-backend bretunetech-staging-frontend
pm2 delete bretunetech-staging-backend bretunetech-staging-frontend
# optional: disable nginx staging sites, drop bretunetech_staging DB
```

Production remains on `/var/www/bretunetech` and existing PM2 names.
