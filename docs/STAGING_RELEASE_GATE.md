# Staging release gate — independent review

Reviewed branch head e87db1f2aced5faffa15f398836cfc2fcdd56184. This is an approval checklist, not evidence of a deployed staging environment. Do not merge PR #2 or run the staging deployment until the operator approves the plan after reviewing the host assessment.

## Host assessment

Run the existing scripts/staging-vps-assess.sh in an authenticated VPS shell. Also run `uptime`, `vmstat 1 5`, `ss -lntH`, `command -v pg_restore`, `pg_restore --version`, and inspect the actual Nginx virtual hosts locally. Do not paste credentials, full environment files, or unredacted config. Confirm sufficient RAM/disk for two builds and backup, and confirm ports 3005/4005 or 3015/4015 are available. Verify pg_dump major version is compatible with the server.

## Blockers before applying scripts/deploy-staging.sh

- Validate the effective DATABASE_URL used by Prisma AND runtime against exact database name bretunetech_staging, exact role bretune_staging and approved local host/port. The current substring checks are insufficient; shell env and backend/.env may differ. Verify current_database() and current_user before schema operations. Ensure the staging role has no production database access or ownership. Refuse production path, symlink alias, and occupied ports unless owned by the expected staging process.
- Require exact effective values NEWSLETTER_PROVIDER=mock, MAIL_MOCK=1, NEWSLETTER_SENDING_ENABLED=false and NEWSLETTER_WORKER_ENABLED=false. Guard inherited process variables and PM2 env. Check all external mail paths, including OTP and confirmations. No live integration keys in staging.
- Install development dependencies for TypeScript and Prisma builds; use npm ci and fail rather than fallback to npm install. Bind applications to loopback or enforce equivalent firewall isolation. Keep port overrides consistent across PM2 and Nginx.
- Do not install the current TLS vhosts with commented certificate directives. Bootstrap ACME-only HTTP vhosts, issue certificates, then install TLS configuration and run nginx -t before reload. Protect both frontend and API: preferably IP/VPN allowlist or same-origin reverse proxy with compatible auth; HTTP Basic and application Bearer authorization can conflict on an API route. Test authentication and preflight behavior. No public unauthenticated staging API, even if admin endpoints require JWT.
- db push is acceptable only for explicitly disposable synthetic staging data; do not treat it as migration-history validation. Do not use it on production.
- Production pg_dump must strip Prisma-only URI query parameters such as schema=, without logging credentials. Verify archive with pg_restore --list and isolated restore. Avoid destructive automatic database rollback; capture operator-approved recovery procedure.

## Test evidence required

Run npm run newsletter:verify-pending in an isolated Docker environment, not a production Postgres server. The existing fixture constructs a representative pre-upgrade shape and marks historical migrations applied only on disposable DBs; it does not prove production history compatibility. Require pg_restore exit zero, including Docker branch, and verify schema and synthetic records. Investigate greenfield failure and compare production migration ledger read-only before release; never resolve production migrations blindly.

Seed synthetic admin and restricted user only in staging. Run frontend npm run test:newsletter-e2e with NEWSLETTER_E2E=1 and staging-only credentials, inspect nine executed results and screenshots. Assert no external mail delivery. Run newsletter-specific lint, backend build/unit/integration and frontend build. Record actual results, failures and skips; no screenshots or test success claimed without evidence.

## Approval and rollout

Operator confirms host capacity, exact isolated DB, network/access controls and mock mail before staging provisioning. After successful browser testing, obtain separate production release approval. Check production effective runtime flags (not only .env) are both false; verify backup, pending migration history, and health/rollback readiness before merge. No merge, production deployment or sending is authorized by staging approval.
