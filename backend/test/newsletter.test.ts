import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import { signUnsubscribeToken, verifyUnsubscribeToken, hashToken, newSubscriberToken } from '../src/modules/newsletter/newsletter.tokens';
import {
  sanitizeTrackingDestination,
  signTrackingToken,
  verifyResendWebhookSignature,
  verifyTrackingToken,
  backoffMs,
} from '../src/modules/newsletter/newsletter.security';
import { formatInJohannesburg, johannesburgMonthKey, parseScheduleInput } from '../src/modules/newsletter/newsletter.time';
import {
  canSendWithinRate,
  recordSendInRateWindow,
  resetNewsletterRateLimiterForTests,
} from '../src/modules/newsletter/newsletter.rate';

describe('newsletter tokens', () => {
  test('unsubscribe token verifies for subscriber id', () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const token = signUnsubscribeToken(id);
    assert.ok(verifyUnsubscribeToken(id, token));
    assert.equal(verifyUnsubscribeToken(id, token + 'x'), false);
  });

  test('confirm token hash is deterministic', () => {
    const raw = newSubscriberToken();
    assert.equal(hashToken(raw), hashToken(raw));
    assert.notEqual(hashToken(raw), hashToken(raw + 'x'));
  });
});

describe('newsletter tracking security', () => {
  test('signed open token verifies and rejects tampering', () => {
    const token = signTrackingToken({
      recipientId: '00000000-0000-4000-8000-000000000002',
      purpose: 'open',
    });
    const verified = verifyTrackingToken(token, 'open');
    assert.ok(verified);
    assert.equal(verified!.recipientId, '00000000-0000-4000-8000-000000000002');
    assert.equal(verifyTrackingToken(token + 'x', 'open'), null);
    assert.equal(verifyTrackingToken(token, 'click'), null);
  });

  test('signed click token carries destination', () => {
    const token = signTrackingToken({
      recipientId: '00000000-0000-4000-8000-000000000003',
      purpose: 'click',
      destination: 'https://bretunetech.com/products/demo',
    });
    const verified = verifyTrackingToken(token, 'click');
    assert.ok(verified);
    assert.equal(verified!.destination, 'https://bretunetech.com/products/demo');
  });

  test('tracking destinations reject open redirects', () => {
    assert.equal(sanitizeTrackingDestination('https://evil.example/phish'), null);
    assert.equal(sanitizeTrackingDestination('//evil.example'), null);
    assert.ok(sanitizeTrackingDestination('/products')?.startsWith('https://bretunetech.com/products'));
    assert.ok(sanitizeTrackingDestination('https://bretunetech.com/services/wifi-installations'));
  });
});

describe('newsletter webhook verification', () => {
  test('accepts valid Svix-style signatures and rejects invalid ones', () => {
    const secret = 'whsec_' + Buffer.from('super-secret-webhook-key').toString('base64');
    const rawBody = JSON.stringify({ type: 'email.delivered', data: { email_id: 're_123' } });
    const svixId = 'msg_test_1';
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const key = Buffer.from(secret.slice(6), 'base64');
    const expected = createHmac('sha256', key)
      .update(`${svixId}.${svixTimestamp}.${rawBody}`)
      .digest('base64');

    assert.equal(
      verifyResendWebhookSignature({
        rawBody,
        secret,
        svixId,
        svixTimestamp,
        svixSignature: `v1,${expected}`,
      }),
      true,
    );

    assert.equal(
      verifyResendWebhookSignature({
        rawBody,
        secret,
        svixId,
        svixTimestamp,
        svixSignature: 'v1,not-valid',
      }),
      false,
    );

    assert.equal(
      verifyResendWebhookSignature({
        rawBody,
        secret,
        svixId,
        svixTimestamp: String(Math.floor(Date.now() / 1000) - 10_000),
        svixSignature: `v1,${expected}`,
      }),
      false,
    );
  });
});

describe('newsletter scheduling time', () => {
  test('parses Johannesburg naive datetimes as UTC+2', () => {
    const d = parseScheduleInput('2030-01-15T08:00:00');
    assert.equal(d.toISOString(), '2030-01-15T06:00:00.000Z');
    assert.ok(formatInJohannesburg(d)?.includes('2030'));
  });

  test('month key uses Johannesburg calendar', () => {
    assert.match(johannesburgMonthKey(new Date('2030-01-01T10:00:00Z')), /^\d{4}-\d{2}$/);
  });
});

describe('newsletter queue helpers', () => {
  test('rate limiter blocks after configured sends per minute', () => {
    resetNewsletterRateLimiterForTests();
    assert.equal(canSendWithinRate(2), true);
    recordSendInRateWindow();
    recordSendInRateWindow();
    assert.equal(canSendWithinRate(2), false);
  });

  test('backoff grows with attempts', () => {
    assert.ok(backoffMs(1) >= 1000);
    assert.ok(backoffMs(5) > backoffMs(2));
  });
});

describe('newsletter consent rules', () => {
  test('marketing consent text is required for public subscribe schema', async () => {
    const { subscribeSchema } = await import('../src/modules/newsletter/newsletter.dto');
    const bad = subscribeSchema.safeParse({
      email: 'person@example.com',
      marketingConsent: false,
      source: 'website-footer',
    });
    assert.equal(bad.success, false);

    const good = subscribeSchema.safeParse({
      email: 'person@example.com',
      marketingConsent: true,
      source: 'website-footer',
    });
    assert.equal(good.success, true);
  });

  test('legacy auto-enroll source constant is customer-account', async () => {
    const { LEGACY_AUTO_ENROLL_SOURCE } = await import('../src/modules/newsletter/newsletter.config');
    assert.equal(LEGACY_AUTO_ENROLL_SOURCE, 'customer-account');
  });

  test('Resend idempotency window is 24 hours', async () => {
    const { RESEND_IDEMPOTENCY_WINDOW_MS } = await import('../src/modules/newsletter/newsletter.config');
    assert.equal(RESEND_IDEMPOTENCY_WINDOW_MS, 24 * 60 * 60 * 1000);
  });

  test('new block types validate in campaign schema', async () => {
    const { createCampaignSchema } = await import('../src/modules/newsletter/newsletter.dto');
    const parsed = createCampaignSchema.safeParse({
      title: 'Blocks',
      subject: 'Subject',
      audience: { consentOnly: true, activity: 'all' },
      blocks: [
        { type: 'divider' },
        { type: 'spacer', height: 24 },
        { type: 'contact', email: 'sales@bretunetech.com' },
        { type: 'offer', headline: 'Deal', detail: 'Ask sales' },
        { type: 'project', title: 'Site', summary: 'Completed install' },
        { type: 'cta', label: 'Shop', href: '/products' },
      ],
    });
    assert.equal(parsed.success, true);
  });
});

describe('newsletter provider fail-closed', () => {
  test('assertNewsletterProviderConfigured rejects missing credentials', async () => {
    const { assertNewsletterProviderConfigured } = await import('../src/modules/newsletter/newsletter.provider');
    const { newsletterConfig: cfg } = await import('../src/modules/newsletter/newsletter.config');
    const prevProvider = (cfg as any).provider;
    const prevKey = (cfg as any).resendApiKey;
    const prevPass = (cfg as any).smtpPass;
    try {
      (cfg as any).provider = 'resend';
      (cfg as any).resendApiKey = '';
      assert.throws(() => assertNewsletterProviderConfigured(), /RESEND_API_KEY/);
      (cfg as any).provider = 'smtp';
      (cfg as any).smtpPass = '';
      assert.throws(() => assertNewsletterProviderConfigured(), /NEWSLETTER_SMTP/);
    } finally {
      (cfg as any).provider = prevProvider;
      (cfg as any).resendApiKey = prevKey;
      (cfg as any).smtpPass = prevPass;
    }
  });
});

describe('newsletter campaign edit guards (schema)', () => {
  test('schedule campaign requires scheduledAt', async () => {
    const { scheduleCampaignSchema } = await import('../src/modules/newsletter/newsletter.dto');
    assert.equal(scheduleCampaignSchema.safeParse({}).success, false);
    assert.equal(scheduleCampaignSchema.safeParse({ scheduledAt: '2030-06-01T08:00:00' }).success, true);
  });
});
