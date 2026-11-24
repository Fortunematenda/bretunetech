# Newsletter admin screenshots

Captured by Playwright (`frontend/e2e/newsletter.spec.ts`) when `NEWSLETTER_E2E=1`.

Expected files under `frontend/test-results/screenshots/`:

| File | Surface |
|---|---|
| `dashboard-1440.png` | Marketing dashboard |
| `subscribers-390.png` | Subscribers (mobile) |
| `templates-1440.png` | Templates |
| `campaign-editor-1440.png` / `campaign-editor-1024.png` | Campaign editor |
| `campaign-workflow-1440.png` | Campaign workflow / schedule |
| `calendar-1440.png` | Calendar |
| `analytics-1440.png` | Analytics |

Run against staging (after staging is approved and live):

```powershell
cd frontend
$env:NEWSLETTER_E2E='1'
$env:E2E_BASE_URL='https://staging.bretunetech.com'
$env:E2E_API_URL='https://staging-api.bretunetech.com/api'
$env:E2E_ADMIN_EMAIL='…'
$env:E2E_ADMIN_PASSWORD='…'
npx playwright test e2e/newsletter.spec.ts
```

Do not commit credentials. Screenshots may be attached to the PR as artifacts; avoid committing PII.
