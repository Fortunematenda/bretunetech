# Newsletter admin screenshots

Authenticated screenshots are produced by Playwright when e2e credentials are set:

```bash
cd frontend
set NEWSLETTER_E2E=1
set E2E_BASE_URL=http://127.0.0.1:3000
set E2E_API_URL=http://127.0.0.1:4000
set E2E_ADMIN_EMAIL=your-admin@bretunetech.com
set E2E_ADMIN_PASSWORD=********
npm run test:newsletter-e2e
```

Output (gitignored):

- `frontend/test-results/screenshots/dashboard-1440.png`
- `frontend/test-results/screenshots/subscribers-390.png`
- `frontend/test-results/screenshots/campaign-editor-1440.png`
- `frontend/test-results/screenshots/campaign-editor-1024.png`
- `frontend/test-results/screenshots/templates-1440.png`
- `frontend/test-results/screenshots/calendar-1440.png`
- `frontend/test-results/screenshots/analytics-1440.png`

Do not commit credentials or production dumps into this folder.
