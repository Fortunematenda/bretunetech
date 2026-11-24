/**
 * PostgreSQL integration tests for newsletter queue hardening.
 *
 * Requires:
 *   NEWSLETTER_INTEGRATION_TEST=1
 *   DATABASE_URL pointing at an isolated test database
 *
 * Provider is mocked — no real emails are sent.
 */
import 'dotenv/config';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'crypto';
import { setNewsletterSendImplForTests } from '../src/modules/newsletter/newsletter.provider';
import {
  MARKETING_CONSENT_TEXT,
  LEGACY_AUTO_ENROLL_SOURCE,
} from '../src/modules/newsletter/newsletter.config';

const enabled = process.env.NEWSLETTER_INTEGRATION_TEST === '1' && Boolean(process.env.DATABASE_URL);

describe('newsletter integration', { skip: !enabled }, () => {
  let prisma: typeof import('../src/lib/prisma').default;
  let newsletterService: typeof import('../src/modules/newsletter/newsletter.service').newsletterService;
  let newsletterConfig: typeof import('../src/modules/newsletter/newsletter.config').newsletterConfig;

  const ids = {
    campaign: '' as string,
    subscriberA: '' as string,
    subscriberB: '' as string,
    subscriberLegacy: '' as string,
  };

  const sentTo: string[] = [];

  before(async () => {
    process.env.NEWSLETTER_WORKER_ENABLED = 'true';
    process.env.NEWSLETTER_SENDING_ENABLED = 'true';
    process.env.NEWSLETTER_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 'test-key-not-used';
    process.env.RESEND_WEBHOOK_SECRET =
      'whsec_' + Buffer.from('integration-webhook-secret').toString('base64');

    prisma = (await import('../src/lib/prisma')).default;
    ({ newsletterService } = await import('../src/modules/newsletter/newsletter.service'));
    ({ newsletterConfig } = await import('../src/modules/newsletter/newsletter.config'));

    // Force flags for this process (config is evaluated at import).
    (newsletterConfig as any).workerEnabled = true;
    (newsletterConfig as any).sendingEnabled = true;
    (newsletterConfig as any).provider = 'resend';
    (newsletterConfig as any).webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    (newsletterConfig as any).resendApiKey = 'test-key';
    (newsletterConfig as any).batchSize = 10;
    (newsletterConfig as any).ratePerMinute = 1000;

    setNewsletterSendImplForTests(async (payload) => {
      sentTo.push(payload.to);
      return { providerMessageId: `mock_${randomUUID()}`, mode: 'resend' };
    });

    const suffix = randomUUID().slice(0, 8);
    const subA = await prisma.newsletterSubscriber.create({
      data: {
        email: `int-a-${suffix}@example.com`,
        source: 'website',
        consentText: MARKETING_CONSENT_TEXT,
        consentAt: new Date(),
        status: 'ACTIVE',
        confirmedAt: new Date(),
      },
    });
    const subB = await prisma.newsletterSubscriber.create({
      data: {
        email: `int-b-${suffix}@example.com`,
        source: 'website',
        consentText: MARKETING_CONSENT_TEXT,
        consentAt: new Date(),
        status: 'ACTIVE',
        confirmedAt: new Date(),
      },
    });
    const subLegacy = await prisma.newsletterSubscriber.create({
      data: {
        email: `int-legacy-${suffix}@example.com`,
        source: LEGACY_AUTO_ENROLL_SOURCE,
        consentText: 'legacy auto enroll',
        consentAt: new Date(),
        status: 'ACTIVE',
        confirmedAt: new Date(),
      },
    });
    ids.subscriberA = subA.id;
    ids.subscriberB = subB.id;
    ids.subscriberLegacy = subLegacy.id;

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        title: `Integration ${suffix}`,
        subject: 'Integration test',
        previewText: '',
        fromName: 'Test',
        fromEmail: 'newsletter@bretunetech.com',
        audience: { consentOnly: true, activity: 'all' },
        status: 'SENDING',
        blocks: [{ type: 'hero', headline: 'Hi', subhead: 'Test' }],
      },
    });
    ids.campaign = campaign.id;

    for (const sub of [subA, subB, subLegacy]) {
      await prisma.newsletterRecipient.create({
        data: {
          campaignId: campaign.id,
          subscriberId: sub.id,
          email: sub.email,
          status: 'PENDING',
          idempotencyKey: `${campaign.id}:${sub.id}`,
        },
      });
    }
  });

  after(async () => {
    setNewsletterSendImplForTests(null);
    if (!prisma || !ids.campaign) return;
    await prisma.newsletterPendingWebhook.deleteMany({});
    await prisma.newsletterEvent.deleteMany({ where: { campaignId: ids.campaign } });
    await prisma.newsletterRecipient.deleteMany({ where: { campaignId: ids.campaign } });
    await prisma.newsletterWebhookReceipt.deleteMany({
      where: { providerEventId: { startsWith: 'msg_int_' } },
    });
    await prisma.newsletterCampaign.delete({ where: { id: ids.campaign } }).catch(() => undefined);
    await prisma.newsletterSubscriber.deleteMany({
      where: { id: { in: [ids.subscriberA, ids.subscriberB, ids.subscriberLegacy] } },
    });
    await prisma.newsletterWorkerLock.deleteMany({ where: { id: 'queue' } });
    await prisma.$disconnect();
  });

  test('legacy auto-enrolled subscribers are excluded from audience', async () => {
    const audience = await newsletterService.resolveAudience({ consentOnly: true, activity: 'all' });
    assert.ok(!audience.some((s) => s.id === ids.subscriberLegacy));
    assert.ok(audience.some((s) => s.id === ids.subscriberA));
  });

  test('consent audit dry-run reports legacy subscribers without mutating', async () => {
    const before = await prisma.newsletterSubscriber.findUnique({ where: { id: ids.subscriberLegacy } });
    const report = await newsletterService.auditConsentDryRun();
    assert.equal(report.dryRun, true);
    assert.ok(report.requireConsentReview >= 1);
    const after = await prisma.newsletterSubscriber.findUnique({ where: { id: ids.subscriberLegacy } });
    assert.equal(after?.status, before?.status);
    assert.equal(after?.source, LEGACY_AUTO_ENROLL_SOURCE);
  });

  test('concurrent claims never assign the same recipient twice', async () => {
    const claim = (newsletterService as any).claimNextRecipient.bind(newsletterService);
    const [a, b] = await Promise.all([claim(ids.campaign), claim(ids.campaign)]);
    assert.ok(a);
    assert.ok(b);
    assert.notEqual(a.id, b.id);
    assert.equal(a.status, 'QUEUED');
    assert.equal(b.status, 'QUEUED');
    // Release claims back to PENDING for later tests
    await prisma.newsletterRecipient.updateMany({
      where: { id: { in: [a.id, b.id] } },
      data: { status: 'PENDING', claimedAt: null, claimToken: null, attempts: 0 },
    });
  });

  test('crash recovery does not blind-resend DISPATCHING without provider id (resend → PENDING)', async () => {
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberA },
    });
    assert.ok(rec);
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: {
        status: 'DISPATCHING',
        claimedAt: new Date(Date.now() - 10 * 60_000),
        firstDispatchedAt: new Date(Date.now() - 10 * 60_000),
        claimToken: 'stale-token',
        providerMessageId: null,
      },
    });
    (newsletterConfig as any).provider = 'resend';
    const result = await newsletterService.recoverStaleClaims(60_000);
    assert.ok(result.recovered >= 1);
    const after = await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } });
    assert.equal(after?.status, 'PENDING');
    assert.equal(after?.claimToken, null);
  });

  test('Resend recovery outside idempotency window requires manual reconciliation', async () => {
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberA },
    });
    assert.ok(rec);
    const expired = new Date(Date.now() - 25 * 60 * 60_000);
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: {
        status: 'DISPATCHING',
        claimedAt: expired,
        firstDispatchedAt: expired,
        claimToken: 'expired-token',
        providerMessageId: null,
        lastError: null,
      },
    });
    (newsletterConfig as any).provider = 'resend';
    const result = await newsletterService.recoverStaleClaims(60_000);
    assert.ok(result.ambiguous >= 1);
    const after = await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } });
    assert.equal(after?.status, 'AMBIGUOUS');
    assert.match(String(after?.lastError || ''), /idempotency-window-expired/);
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: { status: 'PENDING', lastError: null, claimToken: null, claimedAt: null },
    });
  });

  test('legacy customer-account can re-consent via double opt-in without deleting the row', async () => {
    const before = await prisma.newsletterSubscriber.findUnique({ where: { id: ids.subscriberLegacy } });
    assert.ok(before);
    assert.equal(before!.source, LEGACY_AUTO_ENROLL_SOURCE);
    assert.equal(before!.status, 'ACTIVE');

    // Suppression must still block re-consent.
    await prisma.newsletterSuppression.create({
      data: { email: before!.email, reason: 'manual_test', detail: 'integration' },
    });
    await assert.rejects(
      () =>
        newsletterService.subscribe({
          email: before!.email,
          source: 'website-reconsent',
        }),
      /cannot be subscribed/i,
    );
    await prisma.newsletterSuppression.delete({ where: { email: before!.email } });

    const prevDoubleOptIn = (newsletterConfig as any).doubleOptIn;
    (newsletterConfig as any).doubleOptIn = true;
    // Avoid real SMTP for confirm mail: exercise path with double opt-in off for persistence,
    // then separately assert PENDING path with a stubbed mailer if needed.
    (newsletterConfig as any).doubleOptIn = false;
    const result = await newsletterService.subscribe({
      email: before!.email,
      source: 'website-footer',
      firstName: before!.firstName || undefined,
    });
    assert.equal(result.requiresConfirmation, false);
    assert.equal(result.status, 'ACTIVE');

    const after = await prisma.newsletterSubscriber.findUnique({ where: { id: ids.subscriberLegacy } });
    assert.ok(after);
    assert.equal(after!.id, before!.id);
    assert.notEqual(after!.source, LEGACY_AUTO_ENROLL_SOURCE);
    assert.equal(after!.consentText, MARKETING_CONSENT_TEXT);
    (newsletterConfig as any).doubleOptIn = prevDoubleOptIn;

    // With double opt-in on, legacy ACTIVE must be allowed to enter PENDING (no ConflictError).
    await prisma.newsletterSubscriber.update({
      where: { id: ids.subscriberLegacy },
      data: {
        status: 'ACTIVE',
        source: LEGACY_AUTO_ENROLL_SOURCE,
        confirmedAt: new Date(),
        confirmTokenHash: null,
      },
    });
    (newsletterConfig as any).doubleOptIn = true;
    const originalSendMail = (await import('../src/lib/mailer')).mailer.sendMail;
    (await import('../src/lib/mailer')).mailer.sendMail = (async () => ({ messageId: 'test' })) as any;
    try {
      const pending = await newsletterService.subscribe({
        email: before!.email,
        source: 'website-footer',
      });
      assert.equal(pending.status, 'PENDING');
      assert.equal(pending.requiresConfirmation, true);
      const pendingRow = await prisma.newsletterSubscriber.findUnique({ where: { id: ids.subscriberLegacy } });
      assert.equal(pendingRow?.status, 'PENDING');
      assert.notEqual(pendingRow?.source, LEGACY_AUTO_ENROLL_SOURCE);
      assert.ok(pendingRow?.confirmTokenHash);
    } finally {
      (await import('../src/lib/mailer')).mailer.sendMail = originalSendMail;
      (newsletterConfig as any).doubleOptIn = prevDoubleOptIn;
    }

    // Restore fixture for later tests that expect ACTIVE legacy exclusion semantics where needed.
    await prisma.newsletterSubscriber.update({
      where: { id: ids.subscriberLegacy },
      data: {
        status: 'ACTIVE',
        source: LEGACY_AUTO_ENROLL_SOURCE,
        confirmedAt: new Date(),
        confirmTokenHash: null,
      },
    });
  });

  test('crash recovery marks SMTP DISPATCHING without id as AMBIGUOUS (no auto-retry)', async () => {
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberB },
    });
    assert.ok(rec);
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: {
        status: 'DISPATCHING',
        claimedAt: new Date(Date.now() - 10 * 60_000),
        claimToken: 'stale-smtp',
        providerMessageId: null,
      },
    });
    (newsletterConfig as any).provider = 'smtp';
    const result = await newsletterService.recoverStaleClaims(60_000);
    assert.ok(result.ambiguous >= 1);
    const after = await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } });
    assert.equal(after?.status, 'AMBIGUOUS');
    (newsletterConfig as any).provider = 'resend';
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: { status: 'PENDING', lastError: null, claimToken: null, claimedAt: null },
    });
  });

  test('cancelling an active campaign skips remaining unsent recipients', async () => {
    await prisma.newsletterCampaign.update({
      where: { id: ids.campaign },
      data: { status: 'SENDING' },
    });
    await prisma.newsletterRecipient.updateMany({
      where: { campaignId: ids.campaign },
      data: { status: 'PENDING', claimedAt: null, claimToken: null },
    });
    await newsletterService.cancelCampaign(ids.campaign);
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: ids.campaign } });
    assert.equal(campaign?.status, 'CANCELLED');
    const open = await prisma.newsletterRecipient.count({
      where: {
        campaignId: ids.campaign,
        status: { in: ['PENDING', 'QUEUED', 'DISPATCHING'] },
      },
    });
    assert.equal(open, 0);
  });

  test('webhook replay is idempotent; DB unique violation only counts as duplicate', async () => {
    // Re-open a recipient as SENT with provider id for webhook targeting
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberA },
    });
    assert.ok(rec);
    const providerMessageId = `mock_webhook_${randomUUID()}`;
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: { status: 'SENT', providerMessageId, sentAt: new Date(), lastError: null },
    });
    await prisma.newsletterCampaign.update({
      where: { id: ids.campaign },
      data: { status: 'SENDING' },
    });

    const secret = process.env.RESEND_WEBHOOK_SECRET!;
    const rawBody = JSON.stringify({
      type: 'email.delivered',
      data: { email_id: providerMessageId },
    });
    const svixId = `msg_int_${randomUUID()}`;
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const key = Buffer.from(secret.slice(6), 'base64');
    const expected = createHmac('sha256', key)
      .update(`${svixId}.${svixTimestamp}.${rawBody}`)
      .digest('base64');
    const headers = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': `v1,${expected}`,
    };

    const first = await newsletterService.handleResendWebhook({ rawBody, headers });
    assert.equal(first.received, true);
    assert.equal((first as any).duplicate, undefined);

    const second = await newsletterService.handleResendWebhook({ rawBody, headers });
    assert.equal(second.duplicate, true);

    const delivered = await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } });
    assert.equal(delivered?.status, 'DELIVERED');
  });

  test('early webhook is parked then applied after providerMessageId persistence', async () => {
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberB },
    });
    assert.ok(rec);
    const providerMessageId = `mock_early_${randomUUID()}`;
    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: { status: 'DISPATCHING', providerMessageId: null, claimToken: 'early', claimedAt: new Date() },
    });

    const secret = process.env.RESEND_WEBHOOK_SECRET!;
    const rawBody = JSON.stringify({
      type: 'email.bounced',
      data: { email_id: providerMessageId },
    });
    const svixId = `msg_int_${randomUUID()}`;
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const key = Buffer.from(secret.slice(6), 'base64');
    const expected = createHmac('sha256', key)
      .update(`${svixId}.${svixTimestamp}.${rawBody}`)
      .digest('base64');

    await newsletterService.handleResendWebhook({
      rawBody,
      headers: {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': `v1,${expected}`,
      },
    });

    const pending = await prisma.newsletterPendingWebhook.findFirst({ where: { providerMessageId } });
    assert.ok(pending);

    await prisma.newsletterRecipient.update({
      where: { id: rec!.id },
      data: { status: 'SENT', providerMessageId, sentAt: new Date(), claimToken: null },
    });
    await newsletterService.applyPendingWebhooks(rec!.id, providerMessageId);

    const after = await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } });
    assert.equal(after?.status, 'BOUNCED');
    const stillPending = await prisma.newsletterPendingWebhook.findFirst({ where: { providerMessageId } });
    assert.equal(stillPending, null);
  });

  test('out-of-order delivered does not override bounce', async () => {
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberB },
    });
    assert.ok(rec);
    assert.equal((await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } }))?.status, 'BOUNCED');

    const providerMessageId = (await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } }))!
      .providerMessageId!;
    const secret = process.env.RESEND_WEBHOOK_SECRET!;
    const rawBody = JSON.stringify({
      type: 'email.delivered',
      data: { email_id: providerMessageId },
    });
    const svixId = `msg_int_${randomUUID()}`;
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const key = Buffer.from(secret.slice(6), 'base64');
    const expected = createHmac('sha256', key)
      .update(`${svixId}.${svixTimestamp}.${rawBody}`)
      .digest('base64');

    await newsletterService.handleResendWebhook({
      rawBody,
      headers: {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': `v1,${expected}`,
      },
    });

    const after = await prisma.newsletterRecipient.findUnique({ where: { id: rec!.id } });
    assert.equal(after?.status, 'BOUNCED');
  });

  test('unsubscribe during queue skips remaining eligibility checks', async () => {
    // Fresh campaign path: re-open campaign, reset one eligible recipient, unsubscribe mid-flight
    await prisma.newsletterCampaign.update({
      where: { id: ids.campaign },
      data: { status: 'SENDING', cancelledAt: null },
    });
    await prisma.newsletterRecipient.updateMany({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberA },
      data: {
        status: 'PENDING',
        providerMessageId: null,
        claimedAt: null,
        claimToken: null,
        lastError: null,
        attempts: 0,
      },
    });
    // Ensure B/legacy stay skipped so queue only considers A
    await prisma.newsletterRecipient.updateMany({
      where: { campaignId: ids.campaign, subscriberId: { not: ids.subscriberA } },
      data: { status: 'SKIPPED', lastError: 'fixture' },
    });

    const { signUnsubscribeToken } = await import('../src/modules/newsletter/newsletter.tokens');
    await newsletterService.unsubscribe({
      subscriberId: ids.subscriberA,
      token: signUnsubscribeToken(ids.subscriberA),
    });

    sentTo.length = 0;
    const result = await newsletterService.processQueueOnce();
    assert.ok(result);
    const rec = await prisma.newsletterRecipient.findFirst({
      where: { campaignId: ids.campaign, subscriberId: ids.subscriberA },
    });
    assert.equal(rec?.status, 'SKIPPED');
    assert.ok(!sentTo.includes(rec!.email));
  });

  test('overlapping worker executions are prevented by lock', async () => {
    await prisma.newsletterCampaign.update({
      where: { id: ids.campaign },
      data: { status: 'SENDING' },
    });
    const { tryAcquireWorkerLock, releaseWorkerLock } = await import(
      '../src/modules/newsletter/newsletter.lock'
    );
    const owner = 'integration-holder';
    assert.equal(await tryAcquireWorkerLock(owner, 30_000), true);
    const result = await newsletterService.processQueueOnce();
    assert.equal((result as any).skipped, 'lock-held');
    await releaseWorkerLock(owner);
  });
});

describe('newsletter integration (skipped notice)', { skip: enabled }, () => {
  test('set NEWSLETTER_INTEGRATION_TEST=1 and DATABASE_URL to run Postgres integration tests', () => {
    assert.ok(true);
  });
});
