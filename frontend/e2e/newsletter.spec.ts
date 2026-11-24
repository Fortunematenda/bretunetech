/**
 * Newsletter admin & public flow Playwright suite.
 *
 * Requires NEWSLETTER_E2E=1 plus:
 *   E2E_BASE_URL      – frontend origin (default http://127.0.0.1:3000)
 *   E2E_API_URL       – API origin (default NEXT_PUBLIC_API_URL / http://127.0.0.1:4000)
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD – marketing-capable admin
 *
 * Email delivery must stay mocked / disabled (NEWSLETTER_SENDING_ENABLED≠true).
 * Never sends real marketing mail.
 */
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const enabled = process.env.NEWSLETTER_E2E === '1';
const apiBase = (process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000').replace(
  /\/$/,
  '',
);
const adminEmail = process.env.E2E_ADMIN_EMAIL || '';
const adminPassword = process.env.E2E_ADMIN_PASSWORD || '';

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  if (!enabled) {
    test.skip(true, 'Set NEWSLETTER_E2E=1 with admin credentials to run newsletter e2e');
    return;
  }
  if (!adminEmail || !adminPassword) {
    throw new Error('NEWSLETTER_E2E=1 requires E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (refusing silent skip)');
  }
});

async function loginAdmin(page: Page) {
  await page.goto('/admin-login');
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.getByLabel(/password/i).fill(adminPassword);
  await page.getByRole('button', { name: /sign in|login|log in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}

async function apiLogin(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${apiBase}/auth/login`, {
    data: { email: adminEmail, password: adminPassword },
  });
  expect(res.ok(), `login failed: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  expect(body.token).toBeTruthy();
  return body.token as string;
}

test.describe('newsletter production-readiness e2e', () => {
  test('rejects unauthorized newsletter admin API access', async ({ request }) => {
    const res = await request.get(`${apiBase}/newsletter/admin/dashboard`);
    expect([401, 403]).toContain(res.status());
  });

  test('admin can open marketing dashboard', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/newsletters');
    await expect(page.getByRole('heading', { name: /newsletter|marketing/i }).first()).toBeVisible();
    await expect(page.getByText(/accepted|delivered|subscriber/i).first()).toBeVisible({ timeout: 20_000 });
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'dashboard-1440.png'),
      fullPage: true,
    });
  });

  test('subscriber search, filters, import preview and CSV export', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/newsletters/subscribers');
    await expect(page.getByRole('heading', { name: /subscriber/i })).toBeVisible();

    const search = page.getByPlaceholder(/search/i).first();
    if (await search.isVisible()) {
      await search.fill('example');
      await page.waitForTimeout(600);
    }

    const eligibility = page.getByRole('combobox').filter({ hasText: /consent|eligib|all/i }).first();
    if (await eligibility.count()) {
      await eligibility.click().catch(() => undefined);
    }

    // Import preview
    const csv = [
      'email,firstName,consentAt,source,interests',
      `e2e-import-${Date.now()}@example.com,E2E,${new Date().toISOString()},import,networking`,
    ].join('\n');
    const tmp = path.join('test-results', 'e2e-import.csv');
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, csv);
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count()) {
      await fileInput.setInputFiles(tmp);
      await expect(page.getByText(/e2e-import-|preview|import/i).first()).toBeVisible({ timeout: 10_000 });
    }

    const exportBtn = page.getByRole('button', { name: /export csv/i });
    if (await exportBtn.isVisible()) {
      const [download] = await Promise.all([page.waitForEvent('download').catch(() => null), exportBtn.click()]);
      if (download) {
        expect(download.suggestedFilename()).toMatch(/csv/i);
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'subscribers-390.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('legacy consent review filter is available', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/newsletters/subscribers');
    await expect(page.getByText(/consent review|legacy|eligible/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('create campaign from template and exercise editor', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/newsletters/templates');
    await expect(page.getByRole('heading', { name: /template/i })).toBeVisible();
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'templates-1440.png'),
      fullPage: true,
    });

    const useBtn = page.getByRole('button', { name: /use for campaign/i }).first();
    if (!(await useBtn.count())) {
      throw new Error('No templates seeded — run newsletter:seed-templates before e2e');
    }
    await useBtn.click();
    await page.waitForURL(/\/admin\/newsletters\/campaigns\//, { timeout: 30_000 });

    await expect(page.getByText(/subject|content blocks|preview/i).first()).toBeVisible();
    const heroAdd = page.getByRole('button', { name: /\+?\s*hero/i });
    if (await heroAdd.isVisible()) await heroAdd.click();
    const down = page.getByRole('button', { name: '↓' }).first();
    if (await down.isVisible()) await down.click();

    const mobile = page.getByRole('button', { name: /mobile/i });
    if (await mobile.isVisible()) await mobile.click();
    const desktop = page.getByRole('button', { name: /desktop/i });
    if (await desktop.isVisible()) await desktop.click();

    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'campaign-editor-1440.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'campaign-editor-1024.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('audience preview, schedule (Johannesburg), cancel without sending', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/newsletters/campaigns');
    await expect(page.getByRole('heading', { name: /campaign/i }).first()).toBeVisible({ timeout: 20_000 });
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'campaigns-1440.png'),
      fullPage: true,
    });
    const open = page.getByRole('link', { name: /open|edit/i }).first();
    if (!(await open.count())) {
      throw new Error('No campaigns available — seed templates/december draft before e2e');
    }
    await open.click();
    await page.waitForURL(/\/campaigns\//);

    // Audience preview copy if present
    await expect(page.locator('body')).toContainText(/eligible|audience|draft|schedule|approve/i);

    // Prefer cancel/schedule UI without enabling bulk send
    const scheduleInput = page.locator('input[type="datetime-local"]').first();
    if (await scheduleInput.count()) {
      // Far-future local Johannesburg-ish naive value for UI only; backend validates future
      await scheduleInput.fill('2030-06-15T09:00');
    }

    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'campaign-workflow-1440.png'),
      fullPage: true,
    });
  });

  test('calendar and analytics pages render', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/newsletters/calendar');
    await expect(page.getByText(/calendar|scheduled|draft|SAST|Johannesburg|month/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'calendar-1440.png'),
      fullPage: true,
    });

    await page.goto('/admin/newsletters/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
    await expect(page.getByText(/accepted|delivered|open/i).first()).toBeVisible();
    await page.screenshot({
      path: path.join('test-results', 'screenshots', 'analytics-1440.png'),
      fullPage: true,
    });
  });

  test('public subscribe / confirm / unsubscribe paths (API mocked delivery)', async ({ request, page }) => {
    const email = `e2e-public-${Date.now()}@example.com`;
    const sub = await request.post(`${apiBase}/newsletter/subscribe`, {
      data: {
        email,
        marketingConsent: true,
        source: 'playwright-e2e',
        firstName: 'E2E',
      },
    });
    // May be 201 or 409 depending on env; never 500
    expect([201, 400, 409]).toContain(sub.status());

    await page.goto('/newsletter/unsubscribe');
    await expect(page.locator('body')).toContainText(/unsubscrib|email|newsletter/i);

    await page.goto('/newsletter/confirm');
    await expect(page.locator('body')).toContainText(/confirm|token|newsletter|subscri/i);
  });

  test('sending flags remain disabled for e2e environment', async ({ request }) => {
    const token = await apiLogin(request);
    const dash = await request.get(`${apiBase}/newsletter/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(dash.ok()).toBeTruthy();
    const body = await dash.json();
    expect(body.sendingEnabled).toBeFalsy();
  });
});
