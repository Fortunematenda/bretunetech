import prisma from '../../lib/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/errors';
import { LEGACY_AUTO_ENROLL_SOURCE, MARKETING_CONSENT_TEXT, newsletterConfig } from './newsletter.config';
import { hashToken, newSubscriberToken, signUnsubscribeToken, verifyUnsubscribeToken } from './newsletter.tokens';
import { renderBlocksToHtml } from './newsletter.render';
import { AmbiguousSendError, assertNewsletterProviderConfigured, sendNewsletterEmail } from './newsletter.provider';
import { auditNewsletter } from './newsletter.audit';
import type { EmailBlock, NewsletterAudience } from './newsletter.types';
import { Prisma } from '../../../generated/prisma/client';
import { mailer } from '../../lib/mailer';
import {
  backoffMs,
  newClaimToken,
  sanitizeTrackingDestination,
  signTrackingToken,
  verifyResendWebhookSignature,
  verifyTrackingToken,
} from './newsletter.security';
import { formatInJohannesburg, johannesburgMonthKey, parseScheduleInput } from './newsletter.time';
import { msUntilSharedRateWindowReset, tryAcquireSendSlot } from './newsletter.rate';
import { newWorkerOwnerId, releaseWorkerLock, tryAcquireWorkerLock } from './newsletter.lock';
import { logger } from '../../lib/logger';

const log = logger.child('NewsletterService');

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

class DuplicateWebhookError extends Error {
  constructor() {
    super('duplicate-webhook');
    this.name = 'DuplicateWebhookError';
  }
}

const TERMINAL_DELIVERY_STATUSES = ['BOUNCED', 'COMPLAINT'] as const;
const OPEN_QUEUE_STATUSES = ['PENDING', 'QUEUED', 'DISPATCHING'] as const;

function isMarketingEligibleSubscriber(sub: {
  status: string;
  confirmedAt: Date | null;
  source: string;
}): boolean {
  if (sub.status !== 'ACTIVE' || !sub.confirmedAt) return false;
  // Legacy auto-enrolled customers are preserved but excluded until they re-consent
  // via public subscribe / import (which sets a non-customer-account source).
  if (sub.source === LEGACY_AUTO_ENROLL_SOURCE) return false;
  return true;
}

async function isSuppressed(email: string, tx: Prisma.TransactionClient | typeof prisma = prisma): Promise<boolean> {
  const hit = await tx.newsletterSuppression.findUnique({ where: { email: email.toLowerCase() } });
  return Boolean(hit);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function withScheduleDisplay<T extends { scheduledAt?: Date | null; sentAt?: Date | null; approvedAt?: Date | null; cancelledAt?: Date | null }>(
  row: T,
) {
  return {
    ...row,
    scheduledAtLocal: formatInJohannesburg(row.scheduledAt),
    sentAtLocal: formatInJohannesburg(row.sentAt),
    approvedAtLocal: formatInJohannesburg(row.approvedAt),
    cancelledAtLocal: formatInJohannesburg(row.cancelledAt),
    timeZone: 'Africa/Johannesburg',
  };
}

export class NewsletterService {
  async getDashboard() {
    const [subscribers, campaigns, sent, recipients, events] = await Promise.all([
      prisma.newsletterSubscriber.groupBy({ by: ['status'], _count: true }),
      prisma.newsletterCampaign.count(),
      prisma.newsletterCampaign.count({ where: { status: 'SENT' } }),
      prisma.newsletterRecipient.groupBy({ by: ['status'], _count: true }),
      prisma.newsletterEvent.groupBy({ by: ['type'], _count: true }),
    ]);

    const accepted =
      (events.find((e) => e.type === 'ACCEPTED')?._count ?? 0) ||
      (recipients.find((r) => r.status === 'SENT' || r.status === 'DELIVERED')?._count ?? 0);
    const delivered = events.find((e) => e.type === 'DELIVERED')?._count ?? 0;
    const deliveryDenominator = delivered > 0 ? delivered : accepted;

    const uniqueOpens = await prisma.newsletterEvent.groupBy({
      by: ['recipientId'],
      where: { type: 'OPEN', recipientId: { not: null } },
      _count: true,
    });
    const uniqueClicks = await prisma.newsletterEvent.groupBy({
      by: ['recipientId'],
      where: { type: 'CLICK', recipientId: { not: null } },
      _count: true,
    });
    const openCount = uniqueOpens.length;
    const clickCount = uniqueClicks.length;
    const bounces = events.find((e) => e.type === 'BOUNCE')?._count ?? 0;
    const complaints = events.find((e) => e.type === 'COMPLAINT')?._count ?? 0;
    const unsubscribes = events.find((e) => e.type === 'UNSUBSCRIBE')?._count ?? 0;
    const failed = recipients.find((r) => r.status === 'FAILED')?._count ?? 0;
    const openRate = deliveryDenominator > 0 ? Math.round((openCount / deliveryDenominator) * 1000) / 10 : 0;
    const clickRate = deliveryDenominator > 0 ? Math.round((clickCount / deliveryDenominator) * 1000) / 10 : 0;

    return {
      subscribers: {
        active: subscribers.find((s) => s.status === 'ACTIVE')?._count ?? 0,
        pending: subscribers.find((s) => s.status === 'PENDING')?._count ?? 0,
        unsubscribed: subscribers.find((s) => s.status === 'UNSUBSCRIBED')?._count ?? 0,
        suppressed: subscribers.find((s) => s.status === 'SUPPRESSED')?._count ?? 0,
      },
      campaigns: { total: campaigns, sent },
      identity: {
        fromName: newsletterConfig.fromName,
        fromEmail: newsletterConfig.fromEmail,
        provider: newsletterConfig.provider,
      },
      delivery: {
        accepted,
        delivered,
        failed,
        bounces,
        complaints,
        unsubscribes,
      },
      engagement: {
        opens: openCount,
        clicks: clickCount,
        openRate,
        clickRate,
        openRateNote:
          'Open and click rates use unique recipients. Denominator prefers confirmed deliveries, otherwise provider-accepted sends.',
      },
      sendingEnabled: newsletterConfig.sendingEnabled,
      workerEnabled: newsletterConfig.workerEnabled,
    };
  }

  async subscribe(input: {
    email: string;
    firstName?: string;
    interests?: string[];
    source: string;
    consentIp?: string | null;
  }) {
    const email = normalizeEmail(input.email);
    if (await isSuppressed(email)) throw new BadRequestError('This email address cannot be subscribed');

    const user = await prisma.user.findUnique({ where: { email } });
    const rawToken = newSubscriberToken();
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    // Marketing list always requires documented consent; double opt-in stays PENDING until confirm.
    const status = newsletterConfig.doubleOptIn ? 'PENDING' : 'ACTIVE';

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing?.status === 'ACTIVE') throw new ConflictError('Already subscribed');
    if (existing?.status === 'SUPPRESSED') throw new BadRequestError('This email address cannot be subscribed');

    const row = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        firstName: input.firstName,
        interests: input.interests ?? [],
        source: input.source,
        consentText: MARKETING_CONSENT_TEXT,
        consentAt: now,
        consentIp: input.consentIp,
        status,
        confirmTokenHash: newsletterConfig.doubleOptIn ? tokenHash : null,
        confirmedAt: newsletterConfig.doubleOptIn ? null : now,
        userId: user?.id,
      },
      update: {
        firstName: input.firstName ?? existing?.firstName,
        interests: input.interests ?? existing?.interests ?? [],
        source: input.source,
        consentText: MARKETING_CONSENT_TEXT,
        consentAt: now,
        consentIp: input.consentIp,
        status,
        confirmTokenHash: newsletterConfig.doubleOptIn ? tokenHash : null,
        confirmedAt: newsletterConfig.doubleOptIn ? null : now,
        userId: user?.id ?? existing?.userId,
      },
    });

    if (newsletterConfig.doubleOptIn) {
      const confirmUrl = `${newsletterConfig.siteUrl}/newsletter/confirm?token=${encodeURIComponent(rawToken)}`;
      await mailer.sendMail({
        from: `"${newsletterConfig.fromName}" <${newsletterConfig.fromEmail}>`,
        to: email,
        subject: 'Confirm your BretuneTech newsletter subscription',
        text: `Please confirm your subscription: ${confirmUrl}`,
        html: `<p>Please confirm you want to receive marketing emails from BretuneTech.</p><p><a href="${confirmUrl}">Confirm subscription</a></p>`,
      });
    }

    await auditNewsletter('subscribe', 'subscriber', row.id, null, {
      source: input.source,
      doubleOptIn: newsletterConfig.doubleOptIn,
    });
    return { status: row.status, requiresConfirmation: newsletterConfig.doubleOptIn };
  }

  async confirmSubscription(token: string) {
    const hash = hashToken(token);
    return prisma.$transaction(async (tx) => {
      const sub = await tx.newsletterSubscriber.findFirst({ where: { confirmTokenHash: hash } });
      if (!sub) throw new NotFoundError('Subscription');
      if (await isSuppressed(sub.email, tx)) {
        throw new BadRequestError('This email address cannot be subscribed');
      }
      if (sub.status === 'ACTIVE' && sub.confirmedAt) {
        return { ok: true, already: true };
      }
      if (sub.status !== 'PENDING' && sub.status !== 'UNSUBSCRIBED') {
        throw new BadRequestError('Subscription cannot be confirmed');
      }
      await tx.newsletterSubscriber.update({
        where: { id: sub.id },
        data: { status: 'ACTIVE', confirmedAt: new Date(), confirmTokenHash: null },
      });
      // Re-consent after unsubscribe clears prior unsubscribe suppression for this address.
      if (sub.status === 'UNSUBSCRIBED') {
        await tx.newsletterSuppression.deleteMany({
          where: { email: sub.email, reason: 'unsubscribe' },
        });
      }
      await auditNewsletter('confirm', 'subscriber', sub.id, null);
      return { ok: true };
    });
  }

  async unsubscribe(body: { token?: string; subscriberId?: string; oneClick?: boolean }) {
    if (body.subscriberId && body.token && verifyUnsubscribeToken(body.subscriberId, body.token)) {
      await this.unsubscribeSubscriber(body.subscriberId, body.oneClick ? 'list_unsubscribe_one_click' : 'one_click');
      return { ok: true };
    }
    if (body.token) {
      const hash = hashToken(body.token);
      const sub = await prisma.newsletterSubscriber.findFirst({ where: { confirmTokenHash: hash } });
      if (sub) {
        await this.unsubscribeSubscriber(sub.id, 'confirm_token');
        return { ok: true };
      }
    }
    throw new NotFoundError('Subscription');
  }

  /**
   * Link a customer account to an existing ACTIVE marketing subscriber only.
   * Never creates or activates marketing consent.
   */
  async linkCustomerAccount(user: { id: string; email: string; firstName?: string | null }) {
    const email = normalizeEmail(user.email);
    if (!email) return { action: 'skipped' as const, reason: 'no-email' };
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!existing) return { action: 'skipped' as const, reason: 'not-subscribed' };
    if (existing.status !== 'ACTIVE') return { action: 'skipped' as const, reason: existing.status };
    if (existing.userId !== user.id) {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { userId: user.id, firstName: existing.firstName || user.firstName || null },
      });
    }
    return { action: 'linked' as const };
  }

  /** @deprecated Auto-enrolment removed. Kept as a no-op link helper for scripts. */
  async enrollCustomerAccount(user: { id: string; email: string; firstName?: string | null }) {
    return this.linkCustomerAccount(user);
  }

  async enrollAllCustomers() {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER', isDeleted: false },
      select: { id: true, email: true, firstName: true },
    });
    const summary = { total: customers.length, enrolled: 0, already: 0, skipped: 0, linked: 0 };
    for (const customer of customers) {
      const result = await this.linkCustomerAccount(customer);
      if (result.action === 'linked') summary.linked++;
      else summary.skipped++;
    }
    return summary;
  }

  private async unsubscribeSubscriber(subscriberId: string, reason: string) {
    await prisma.$transaction(async (tx) => {
      const sub = await tx.newsletterSubscriber.findUnique({ where: { id: subscriberId } });
      if (!sub) throw new NotFoundError('Subscription');

      if (sub.status !== 'UNSUBSCRIBED' && sub.status !== 'SUPPRESSED') {
        await tx.newsletterSubscriber.update({
          where: { id: subscriberId },
          data: { status: 'UNSUBSCRIBED', confirmTokenHash: null },
        });
      }

      await tx.newsletterSuppression.upsert({
        where: { email: sub.email },
        create: { email: sub.email, reason: 'unsubscribe', detail: reason },
        update: { reason: 'unsubscribe', detail: reason },
      });

      const openCampaign = await tx.newsletterRecipient.findFirst({
        where: { subscriberId, status: { in: ['SENT', 'DELIVERED'] } },
        orderBy: { sentAt: 'desc' },
        select: { campaignId: true, id: true },
      });
      if (openCampaign) {
        await tx.newsletterEvent.create({
          data: {
            campaignId: openCampaign.campaignId,
            recipientId: openCampaign.id,
            type: 'UNSUBSCRIBE',
            metadata: { reason },
          },
        });
      }

      await auditNewsletter('unsubscribe', 'subscriber', sub.id, null, { reason });
    });
  }

  /**
   * Dry-run audit: count ACTIVE legacy auto-enrolled subscribers that need consent review.
   * Does not delete, suppress, or mutate records.
   */
  async auditConsentDryRun() {
    const legacyActive = await prisma.newsletterSubscriber.findMany({
      where: { source: LEGACY_AUTO_ENROLL_SOURCE, status: 'ACTIVE' },
      select: { id: true, email: true, confirmedAt: true, consentText: true, status: true, source: true },
    });
    const requireConsentReview = legacyActive.filter((s) => !isMarketingEligibleSubscriber(s));
    const eligibleActive = await prisma.newsletterSubscriber.count({
      where: {
        status: 'ACTIVE',
        confirmedAt: { not: null },
        NOT: { source: LEGACY_AUTO_ENROLL_SOURCE },
      },
    });
    return {
      dryRun: true as const,
      legacyAutoEnrolledActive: legacyActive.length,
      requireConsentReview: requireConsentReview.length,
      eligibleMarketingActive: eligibleActive,
      sampleEmails: requireConsentReview.slice(0, 20).map((s) => s.email),
      note: 'Legacy customer-account subscribers are preserved but excluded from campaigns until they re-consent. Suppression lists were not modified.',
    };
  }

  async resolveAudience(audience: NewsletterAudience) {
    const rows = await prisma.newsletterSubscriber.findMany({
      where: {
        status: 'ACTIVE',
        confirmedAt: { not: null },
        ...(audience.interests?.length ? { interests: { hasSome: audience.interests } } : {}),
      },
      include: {
        user: { select: { id: true, _count: { select: { orders: true } } } },
      },
    });
    const suppressed = new Set(
      (await prisma.newsletterSuppression.findMany({ select: { email: true } })).map((s) => s.email),
    );
    return rows.filter((r) => {
      if (!isMarketingEligibleSubscriber(r)) return false;
      if (suppressed.has(r.email)) return false;
      if (audience.activity === 'purchased') return (r.user?._count.orders ?? 0) > 0;
      if (audience.activity === 'never_purchased') return !r.user || r.user._count.orders === 0;
      return true;
    });
  }

  async listCampaigns() {
    const rows = await prisma.newsletterCampaign.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        subject: true,
        status: true,
        monthKey: true,
        scheduledAt: true,
        sentAt: true,
        cancelledAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    return rows.map(withScheduleDisplay);
  }

  async getCampaign(id: string) {
    const c = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!c) throw new NotFoundError('Campaign');
    return withScheduleDisplay(c);
  }

  async createCampaign(
    data: {
      title: string;
      subject: string;
      previewText?: string;
      fromName?: string;
      fromEmail?: string;
      audience: NewsletterAudience;
      blocks: EmailBlock[];
      monthKey?: string;
      scheduledAt?: Date;
    },
    actorId?: string,
  ) {
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        title: data.title,
        subject: data.subject,
        previewText: data.previewText || '',
        fromName: data.fromName || newsletterConfig.fromName,
        fromEmail: data.fromEmail || newsletterConfig.fromEmail,
        audience: data.audience as unknown as Prisma.InputJsonValue,
        blocks: data.blocks as unknown as Prisma.InputJsonValue,
        monthKey: data.monthKey,
        scheduledAt: data.scheduledAt,
        status: 'DRAFT',
        createdById: actorId,
      },
    });
    await auditNewsletter('create', 'campaign', campaign.id, actorId ?? null);
    return withScheduleDisplay(campaign);
  }

  async deleteCampaign(id: string, actorId?: string) {
    const existing = await this.getCampaign(id);
    if (existing.status === 'SENDING') {
      throw new BadRequestError('This campaign is sending. Wait until it finishes before deleting it.');
    }
    await auditNewsletter('delete', 'campaign', id, actorId ?? null, { title: existing.title, status: existing.status });
    await prisma.newsletterCampaign.delete({ where: { id } });
    return { deleted: true };
  }

  async updateCampaign(id: string, data: Prisma.NewsletterCampaignUpdateInput, actorId?: string) {
    const existing = await this.getCampaign(id);
    if (existing.status === 'SENT') {
      throw new BadRequestError('Sent campaigns cannot be edited. Duplicate the campaign to preserve history and resend.');
    }
    if (existing.status === 'SENDING') {
      throw new BadRequestError('This campaign is sending. Wait until it finishes, or cancel it, before editing.');
    }
    if (existing.status === 'CANCELLED') {
      throw new BadRequestError('Cancelled campaigns cannot be edited. Duplicate the campaign instead.');
    }

    const contentTouched =
      data.title !== undefined ||
      data.subject !== undefined ||
      data.previewText !== undefined ||
      data.blocks !== undefined ||
      data.audience !== undefined ||
      data.fromName !== undefined ||
      data.fromEmail !== undefined;

    const patch: Prisma.NewsletterCampaignUpdateInput = { ...data };
    // Invalidate approval whenever approved content or audience changes.
    if (contentTouched && (existing.status === 'APPROVED' || existing.status === 'SCHEDULED')) {
      patch.status = 'DRAFT';
      patch.approvedAt = null;
      patch.approvedById = null;
      patch.scheduledAt = null;
    }

    const allowedFrom =
      contentTouched && (existing.status === 'APPROVED' || existing.status === 'SCHEDULED')
        ? [existing.status]
        : [existing.status];
    const result = await prisma.newsletterCampaign.updateMany({
      where: { id, status: { in: allowedFrom as any } },
      data: patch as any,
    });
    if (result.count === 0) {
      throw new ConflictError('Campaign was modified concurrently; refresh and retry');
    }
    const campaign = await this.getCampaign(id);
    await auditNewsletter('update', 'campaign', id, actorId ?? null, {
      previousStatus: existing.status,
      revertedToDraft: contentTouched && (existing.status === 'APPROVED' || existing.status === 'SCHEDULED'),
    });
    return withScheduleDisplay(campaign);
  }

  async scheduleCampaign(id: string, scheduledAtInput: string, actorId?: string) {
    const scheduledAt = parseScheduleInput(scheduledAtInput);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestError('scheduledAt must be in the future');
    }
    const result = await prisma.newsletterCampaign.updateMany({
      where: { id, status: { in: ['APPROVED', 'SCHEDULED'] } },
      data: { status: 'SCHEDULED', scheduledAt },
    });
    if (result.count === 0) {
      throw new BadRequestError('Only approved campaigns can be scheduled (or status changed concurrently)');
    }
    const campaign = await this.getCampaign(id);
    await auditNewsletter('schedule', 'campaign', id, actorId ?? null, {
      scheduledAt: scheduledAt.toISOString(),
      scheduledAtLocal: formatInJohannesburg(scheduledAt),
    });
    return withScheduleDisplay(campaign);
  }

  async cancelCampaign(id: string, actorId?: string) {
    const campaign = await prisma.$transaction(async (tx) => {
      const result = await tx.newsletterCampaign.updateMany({
        where: {
          id,
          status: { in: ['APPROVED', 'SCHEDULED', 'PENDING_APPROVAL', 'DRAFT', 'SENDING'] },
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledById: actorId,
          scheduledAt: null,
        },
      });
      if (result.count === 0) {
        throw new BadRequestError('This campaign cannot be cancelled in its current state');
      }
      await tx.newsletterRecipient.updateMany({
        where: { campaignId: id, status: { in: [...OPEN_QUEUE_STATUSES] } },
        data: {
          status: 'SKIPPED',
          lastError: 'campaign-cancelled',
          claimedAt: null,
          claimToken: null,
        },
      });
      return tx.newsletterCampaign.findUniqueOrThrow({ where: { id } });
    });
    await auditNewsletter('cancel', 'campaign', id, actorId ?? null);
    return withScheduleDisplay(campaign);
  }

  async activateDueScheduledCampaigns() {
    if (!newsletterConfig.sendingEnabled || !newsletterConfig.workerEnabled) {
      return { activated: 0 };
    }
    const due = await prisma.newsletterCampaign.findMany({
      where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
      take: 5,
      orderBy: { scheduledAt: 'asc' },
    });
    let activated = 0;
    for (const campaign of due) {
      try {
        await this.startSending(campaign.id, undefined);
        activated++;
      } catch {
        /* leave scheduled for next tick if start fails */
      }
    }
    return { activated };
  }

  async listTemplates() {
    return prisma.newsletterTemplate.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        title: true,
        subject: true,
        previewText: true,
        updatedAt: true,
      },
    });
  }

  async getTemplate(id: string) {
    const t = await prisma.newsletterTemplate.findUnique({ where: { id } });
    if (!t) throw new NotFoundError('Template');
    return t;
  }

  async updateTemplate(
    id: string,
    data: {
      name?: string;
      description?: string;
      title?: string;
      subject?: string;
      previewText?: string;
      audience?: NewsletterAudience;
      blocks?: EmailBlock[];
    },
    actorId?: string,
  ) {
    await this.getTemplate(id);
    const updated = await prisma.newsletterTemplate.update({
      where: { id },
      data: {
        ...data,
        audience: data.audience as Prisma.InputJsonValue | undefined,
        blocks: data.blocks as Prisma.InputJsonValue | undefined,
      },
    });
    await auditNewsletter('update', 'template', id, actorId ?? null);
    return updated;
  }

  async createCampaignFromTemplate(
    templateId: string,
    actorId?: string,
    opts?: { title?: string; monthKey?: string },
  ) {
    const t = await this.getTemplate(templateId);
    const blocks = t.blocks as EmailBlock[];
    const audience = t.audience as NewsletterAudience;
    return this.createCampaign(
      {
        title: opts?.title || `${t.title}`.replace(/\(template\)$/i, '').trim() || t.title,
        subject: t.subject,
        previewText: t.previewText,
        audience,
        blocks,
        monthKey: opts?.monthKey,
      },
      actorId,
    );
  }

  async duplicateCampaign(id: string, actorId?: string) {
    const src = await this.getCampaign(id);
    const copy = await prisma.newsletterCampaign.create({
      data: {
        title: `${src.title} (copy)`,
        subject: src.subject,
        previewText: src.previewText,
        fromName: src.fromName,
        fromEmail: src.fromEmail,
        audience: src.audience as Prisma.InputJsonValue,
        blocks: src.blocks as Prisma.InputJsonValue,
        status: 'DRAFT',
        createdById: actorId,
      },
    });
    await auditNewsletter('duplicate', 'campaign', copy.id, actorId ?? null, { from: id });
    return withScheduleDisplay(copy);
  }

  async submitForApproval(id: string, actorId?: string) {
    const result = await prisma.newsletterCampaign.updateMany({
      where: { id, status: 'DRAFT' },
      data: { status: 'PENDING_APPROVAL' },
    });
    if (result.count === 0) throw new BadRequestError('Campaign is not a draft (or status changed concurrently)');
    const updated = await this.getCampaign(id);
    await auditNewsletter('submit_approval', 'campaign', id, actorId ?? null);
    return withScheduleDisplay(updated);
  }

  async approveCampaign(id: string, actorId?: string) {
    const result = await prisma.newsletterCampaign.updateMany({
      where: { id, status: 'PENDING_APPROVAL' },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: actorId },
    });
    if (result.count === 0) {
      throw new BadRequestError('Campaign is not awaiting approval (or status changed concurrently)');
    }
    const updated = await this.getCampaign(id);
    await auditNewsletter('approve', 'campaign', id, actorId ?? null);
    return withScheduleDisplay(updated);
  }

  async prepareRecipients(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!['APPROVED', 'SCHEDULED', 'SENDING'].includes(campaign.status)) {
      throw new BadRequestError('Campaign must be approved before preparing recipients');
    }
    const audience = campaign.audience as NewsletterAudience;
    const subs = await this.resolveAudience(audience);
    const ops = subs.map((s) =>
      prisma.newsletterRecipient.upsert({
        where: { campaignId_subscriberId: { campaignId, subscriberId: s.id } },
        create: {
          campaignId,
          subscriberId: s.id,
          email: s.email,
          status: 'PENDING',
          idempotencyKey: `${campaignId}:${s.id}`,
        },
        update: {},
      }),
    );
    await prisma.$transaction(ops.slice(0, 500));
    if (ops.length > 500) {
      for (let i = 500; i < ops.length; i += 500) {
        await prisma.$transaction(ops.slice(i, i + 500));
      }
    }
    return { prepared: subs.length };
  }

  async startSending(campaignId: string, actorId?: string) {
    if (!newsletterConfig.sendingEnabled) {
      throw new BadRequestError('Bulk sending is disabled. Set NEWSLETTER_SENDING_ENABLED=true after provider setup.');
    }
    try {
      assertNewsletterProviderConfigured();
    } catch (err: any) {
      throw new BadRequestError(err?.message || 'Newsletter provider is not configured');
    }
    await this.getCampaign(campaignId);
    await this.prepareRecipients(campaignId);
    const result = await prisma.newsletterCampaign.updateMany({
      where: { id: campaignId, status: { in: ['APPROVED', 'SCHEDULED'] } },
      data: { status: 'SENDING', cancelledAt: null, cancelledById: null },
    });
    if (result.count === 0) {
      throw new BadRequestError('Campaign must be approved or scheduled (or status changed concurrently)');
    }
    await auditNewsletter('start_send', 'campaign', campaignId, actorId ?? null);
    return { queued: true };
  }

  async sendTest(campaignId: string, to: string, actorId?: string) {
    const campaign = await this.getCampaign(campaignId);
    const blocks = campaign.blocks as EmailBlock[];
    const email = to.trim().toLowerCase();
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    const unsubscribeUrl = sub
      ? `${newsletterConfig.siteUrl}/newsletter/unsubscribe?id=${encodeURIComponent(sub.id)}&token=${encodeURIComponent(signUnsubscribeToken(sub.id))}`
      : `${newsletterConfig.siteUrl}/newsletter/unsubscribe?test=1`;
    const { html, text } = await renderBlocksToHtml(blocks, {
      unsubscribeUrl,
    });
    const listUnsub = sub
      ? `<${newsletterConfig.apiPublicUrl}/newsletter/unsubscribe/one-click?id=${encodeURIComponent(sub.id)}&token=${encodeURIComponent(signUnsubscribeToken(sub.id))}>`
      : undefined;
    await sendNewsletterEmail(
      {
        to,
        subject: `[TEST] ${campaign.subject}`,
        html,
        text,
        headers: {
          'X-Newsletter-Test': '1',
          ...(listUnsub
            ? {
                'List-Unsubscribe': listUnsub,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              }
            : {}),
        },
      },
      { force: true },
    );
    await auditNewsletter('test_send', 'campaign', campaignId, actorId ?? null, { to });
    return { sent: true };
  }

  /**
   * Recover stale claims without blindly resending messages that may already have been accepted.
   * QUEUED (never dispatched) → PENDING; DISPATCHING with id → SENT; SMTP DISPATCHING without id → AMBIGUOUS;
   * Resend DISPATCHING without id → PENDING (idempotency key enables safe reconciliation).
   */
  async recoverStaleClaims(staleMs = 5 * 60_000) {
    const cutoff = new Date(Date.now() - staleMs);
    const stale = await prisma.newsletterRecipient.findMany({
      where: {
        status: { in: ['QUEUED', 'DISPATCHING'] },
        claimedAt: { lt: cutoff },
      },
      take: 200,
      orderBy: { claimedAt: 'asc' },
    });

    let recovered = 0;
    let ambiguous = 0;
    let accepted = 0;

    for (const rec of stale) {
      if (rec.providerMessageId) {
        const marked = await prisma.newsletterRecipient.updateMany({
          where: {
            id: rec.id,
            claimToken: rec.claimToken,
            status: { in: ['QUEUED', 'DISPATCHING'] },
          },
          data: {
            status: 'SENT',
            sentAt: rec.sentAt ?? new Date(),
            claimedAt: null,
            claimToken: null,
            lastError: null,
          },
        });
        if (marked.count) {
          await prisma.newsletterEvent.create({
            data: {
              campaignId: rec.campaignId,
              recipientId: rec.id,
              type: 'ACCEPTED',
              metadata: { recovered: true, providerMessageId: rec.providerMessageId },
            },
          }).catch(() => undefined);
          await this.applyPendingWebhooks(rec.id, rec.providerMessageId);
          accepted++;
        }
        continue;
      }

      if (rec.status === 'DISPATCHING') {
        if (newsletterConfig.provider === 'resend') {
          // Idempotency-Key on retry reconciles with Resend; do not treat as SMTP-ambiguous.
          const ok = await prisma.newsletterRecipient.updateMany({
            where: {
              id: rec.id,
              claimToken: rec.claimToken,
              status: 'DISPATCHING',
              providerMessageId: null,
            },
            data: {
              status: 'PENDING',
              claimedAt: null,
              claimToken: null,
              lastError: 'recovered-dispatch-timeout-resend',
            },
          });
          if (ok.count) recovered++;
        } else {
          const ok = await prisma.newsletterRecipient.updateMany({
            where: {
              id: rec.id,
              claimToken: rec.claimToken,
              status: 'DISPATCHING',
              providerMessageId: null,
            },
            data: {
              status: 'AMBIGUOUS',
              claimedAt: null,
              claimToken: null,
              lastError: 'ambiguous-smtp-delivery',
            },
          });
          if (ok.count) ambiguous++;
        }
        continue;
      }

      // QUEUED but never entered DISPATCHING — safe to reclaim.
      const ok = await prisma.newsletterRecipient.updateMany({
        where: {
          id: rec.id,
          claimToken: rec.claimToken,
          status: 'QUEUED',
          providerMessageId: null,
        },
        data: { status: 'PENDING', claimedAt: null, claimToken: null },
      });
      if (ok.count) recovered++;
    }

    return { recovered, ambiguous, accepted };
  }

  private async updateRecipientWithClaim(
    id: string,
    claimToken: string | null,
    data: Prisma.NewsletterRecipientUpdateManyMutationInput,
    expectedStatuses?: string[],
  ) {
    const result = await prisma.newsletterRecipient.updateMany({
      where: {
        id,
        ...(claimToken ? { claimToken } : {}),
        ...(expectedStatuses?.length ? { status: { in: expectedStatuses as any } } : {}),
      },
      data,
    });
    return result.count > 0;
  }

  private async claimNextRecipient(campaignId: string) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const candidates = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM newsletter_recipients
        WHERE "campaignId" = ${campaignId}
          AND status = 'PENDING'
          AND ("nextAttemptAt" IS NULL OR "nextAttemptAt" <= ${now})
        ORDER BY id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      `;
      if (!candidates.length) return null;
      const claimToken = newClaimToken();
      const updated = await tx.newsletterRecipient.update({
        where: { id: candidates[0].id },
        data: {
          status: 'QUEUED',
          claimedAt: now,
          claimToken,
          attempts: { increment: 1 },
        },
        include: { subscriber: true },
      });
      return updated;
    });
  }

  async processQueueOnce() {
    if (!newsletterConfig.workerEnabled) return { processed: 0 };
    const ownerId = newWorkerOwnerId();
    const locked = await tryAcquireWorkerLock(ownerId);
    if (!locked) return { processed: 0, skipped: 'lock-held' as const };

    try {
      await this.recoverStaleClaims();
      await this.activateDueScheduledCampaigns();

      const campaigns = await prisma.newsletterCampaign.findMany({ where: { status: 'SENDING' }, take: 3 });
      let processed = 0;

      for (const campaign of campaigns) {
        for (let i = 0; i < newsletterConfig.batchSize; i++) {
          const slot = await tryAcquireSendSlot(newsletterConfig.ratePerMinute);
          if (!slot) {
            return {
              processed,
              rateLimitedForMs: await msUntilSharedRateWindowReset(),
            };
          }

          const rec = await this.claimNextRecipient(campaign.id);
          if (!rec) {
            const pending = await prisma.newsletterRecipient.count({
              where: {
                campaignId: campaign.id,
                status: { in: [...OPEN_QUEUE_STATUSES] },
              },
            });
            if (pending === 0) {
              await prisma.newsletterCampaign.updateMany({
                where: { id: campaign.id, status: 'SENDING' },
                data: { status: 'SENT', sentAt: new Date() },
              });
            }
            break;
          }

          // Recheck campaign status immediately before dispatch.
          const liveCampaign = await prisma.newsletterCampaign.findUnique({ where: { id: campaign.id } });
          if (!liveCampaign || liveCampaign.status !== 'SENDING') {
            await this.updateRecipientWithClaim(rec.id, rec.claimToken, {
              status: 'SKIPPED',
              lastError: 'campaign-not-sending',
              claimedAt: null,
              claimToken: null,
            }, ['QUEUED']);
            continue;
          }

          const fresh = await prisma.newsletterSubscriber.findUnique({ where: { id: rec.subscriberId } });
          if (
            !fresh ||
            !isMarketingEligibleSubscriber(fresh) ||
            (await isSuppressed(rec.email))
          ) {
            await this.updateRecipientWithClaim(rec.id, rec.claimToken, {
              status: 'SKIPPED',
              lastError: 'not-eligible',
              claimedAt: null,
              claimToken: null,
            }, ['QUEUED']);
            continue;
          }

          const moved = await this.updateRecipientWithClaim(
            rec.id,
            rec.claimToken,
            { status: 'DISPATCHING' },
            ['QUEUED'],
          );
          if (!moved) continue;

          const unsubTok = signUnsubscribeToken(rec.subscriberId);
          const unsubUrl = `${newsletterConfig.siteUrl}/newsletter/unsubscribe?id=${encodeURIComponent(rec.subscriberId)}&token=${encodeURIComponent(unsubTok)}`;
          const oneClickUrl = `${newsletterConfig.apiPublicUrl}/newsletter/unsubscribe/one-click?id=${encodeURIComponent(rec.subscriberId)}&token=${encodeURIComponent(unsubTok)}`;
          const openToken = signTrackingToken({ recipientId: rec.id, purpose: 'open' });
          const openUrl = `${newsletterConfig.apiPublicUrl}/newsletter/track/open/${encodeURIComponent(openToken)}.png`;
          const { html, text } = await renderBlocksToHtml(liveCampaign.blocks as EmailBlock[], {
            unsubscribeUrl: unsubUrl,
            preferencesUrl: `${newsletterConfig.siteUrl}/newsletter/preferences`,
            openPixelUrl: openUrl,
            recipientId: rec.id,
            signClick: (href) => {
              const safe = sanitizeTrackingDestination(href);
              if (!safe) return newsletterConfig.siteUrl;
              const token = signTrackingToken({ recipientId: rec.id, purpose: 'click', destination: safe });
              return `${newsletterConfig.apiPublicUrl}/newsletter/track/click/${encodeURIComponent(token)}`;
            },
          });

          let providerResult: { providerMessageId: string; mode: string } | null = null;
          try {
            providerResult = await sendNewsletterEmail({
              to: rec.email,
              subject: liveCampaign.subject,
              html,
              text,
              idempotencyKey: rec.idempotencyKey,
              headers: {
                'List-Unsubscribe': `<${oneClickUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            });
          } catch (err: any) {
            if (err instanceof AmbiguousSendError) {
              // Never auto-retry ambiguous deliveries.
              await this.updateRecipientWithClaim(rec.id, rec.claimToken, {
                status: 'AMBIGUOUS',
                lastError: err.message || 'ambiguous-provider-response',
                claimedAt: null,
                claimToken: null,
              }, ['DISPATCHING']);
              continue;
            }
            const attempts = rec.attempts;
            const failed = attempts >= newsletterConfig.maxSendAttempts;
            await this.updateRecipientWithClaim(rec.id, rec.claimToken, {
              attempts,
              lastError: err?.message || 'send failed',
              status: failed ? 'FAILED' : 'PENDING',
              nextAttemptAt: failed ? null : new Date(Date.now() + backoffMs(attempts)),
              claimedAt: null,
              claimToken: null,
            }, ['DISPATCHING']);
            continue;
          }

          // Provider accepted — separate persistence failures from provider errors.
          try {
            const persisted = await this.updateRecipientWithClaim(
              rec.id,
              rec.claimToken,
              {
                status: 'SENT',
                providerMessageId: providerResult.providerMessageId,
                sentAt: new Date(),
                claimedAt: null,
                claimToken: null,
                nextAttemptAt: null,
                lastError: null,
              },
              ['DISPATCHING'],
            );
            if (!persisted) {
              // Claim may have been cancelled; still try to record message id for reconciliation.
              await prisma.newsletterRecipient.updateMany({
                where: { id: rec.id, providerMessageId: null },
                data: {
                  providerMessageId: providerResult.providerMessageId,
                  status: 'SENT',
                  sentAt: new Date(),
                  lastError: 'accepted-after-claim-lost',
                  claimedAt: null,
                  claimToken: null,
                },
              });
            }
            await prisma.newsletterEvent.create({
              data: {
                campaignId: campaign.id,
                recipientId: rec.id,
                type: 'ACCEPTED',
                metadata: { mode: providerResult.mode },
              },
            });
            await this.applyPendingWebhooks(rec.id, providerResult.providerMessageId);
            processed++;
          } catch (persistErr: any) {
            log.error('Provider accepted message but persistence failed', {
              recipientId: rec.id,
              providerMessageId: providerResult.providerMessageId,
              err: persistErr?.message,
            });
            try {
              await prisma.newsletterRecipient.updateMany({
                where: { id: rec.id },
                data: {
                  status: 'SENT',
                  providerMessageId: providerResult.providerMessageId,
                  sentAt: new Date(),
                  claimedAt: null,
                  claimToken: null,
                  lastError: 'persistence-after-accept',
                },
              });
              await this.applyPendingWebhooks(rec.id, providerResult.providerMessageId);
            } catch (retryErr: any) {
              log.error('Failed to persist accepted provider message id', {
                recipientId: rec.id,
                err: retryErr?.message,
              });
            }
          }
        }
      }
      return { processed };
    } finally {
      await releaseWorkerLock(ownerId);
    }
  }

  /** Apply webhook events that arrived before providerMessageId was stored. */
  async applyPendingWebhooks(recipientId: string, providerMessageId: string) {
    const pending = await prisma.newsletterPendingWebhook.findMany({
      where: { providerMessageId },
      orderBy: { createdAt: 'asc' },
    });
    if (!pending.length) return;
    const rec = await prisma.newsletterRecipient.findUnique({ where: { id: recipientId } });
    if (!rec) return;

    for (const row of pending) {
      try {
        await prisma.$transaction(async (tx) => {
          await this.applyDeliveryEventInTx(tx, rec, row.eventType, row.providerEventId, row.payload);
          await tx.newsletterPendingWebhook.delete({ where: { id: row.id } });
        });
      } catch (err: any) {
        log.error('Failed applying pending webhook', { id: row.id, err: err?.message });
      }
    }
  }

  private async applyDeliveryEventInTx(
    tx: Prisma.TransactionClient,
    rec: { id: string; campaignId: string; email: string; status: string },
    type: string,
    providerEventId: string,
    payload: unknown,
  ) {
    const map: Record<string, 'BOUNCE' | 'COMPLAINT' | 'DELIVERED'> = {
      'email.bounced': 'BOUNCE',
      'email.complained': 'COMPLAINT',
      'email.delivered': 'DELIVERED',
    };
    const evt = map[type];
    if (!evt) return;

    const existing = await tx.newsletterEvent.findFirst({
      where: { providerEventId },
      select: { id: true },
    });
    if (!existing) {
      await tx.newsletterEvent.create({
        data: {
          campaignId: rec.campaignId,
          recipientId: rec.id,
          type: evt,
          providerEventId,
          metadata: payload as Prisma.InputJsonValue,
        },
      });
    }

    if (evt === 'DELIVERED') {
      // Out-of-order: never override bounce/complaint with delivered.
      await tx.newsletterRecipient.updateMany({
        where: {
          id: rec.id,
          status: { notIn: [...TERMINAL_DELIVERY_STATUSES] },
        },
        data: { status: 'DELIVERED' },
      });
      return;
    }

    if (evt === 'BOUNCE') {
      await tx.newsletterRecipient.update({ where: { id: rec.id }, data: { status: 'BOUNCED' } });
      await tx.newsletterSubscriber.updateMany({
        where: { email: rec.email },
        data: { status: 'SUPPRESSED', confirmTokenHash: null },
      });
      await tx.newsletterSuppression.upsert({
        where: { email: rec.email },
        create: { email: rec.email, reason: 'hard_bounce', detail: type },
        update: { reason: 'hard_bounce', detail: type },
      });
      return;
    }

    if (evt === 'COMPLAINT') {
      await tx.newsletterRecipient.update({ where: { id: rec.id }, data: { status: 'COMPLAINT' } });
      await tx.newsletterSubscriber.updateMany({
        where: { email: rec.email },
        data: { status: 'SUPPRESSED', confirmTokenHash: null },
      });
      await tx.newsletterSuppression.upsert({
        where: { email: rec.email },
        create: { email: rec.email, reason: 'complaint', detail: type },
        update: { reason: 'complaint', detail: type },
      });
    }
  }

  async recordOpen(token: string) {
    const verified = verifyTrackingToken(token, 'open');
    if (!verified) return;
    const rec = await prisma.newsletterRecipient.findUnique({ where: { id: verified.recipientId } });
    if (!rec) return;
    const existing = await prisma.newsletterEvent.findFirst({
      where: { recipientId: rec.id, type: 'OPEN' },
      select: { id: true },
    });
    if (existing) return;
    await prisma.newsletterEvent.create({
      data: { campaignId: rec.campaignId, recipientId: rec.id, type: 'OPEN' },
    });
  }

  async recordClick(token: string) {
    const verified = verifyTrackingToken(token, 'click');
    if (!verified) return null;
    const dest = sanitizeTrackingDestination(verified.destination || newsletterConfig.siteUrl);
    if (!dest) return null;
    const rec = await prisma.newsletterRecipient.findUnique({ where: { id: verified.recipientId } });
    if (!rec) return dest;
    const existing = await prisma.newsletterEvent.findFirst({
      where: { recipientId: rec.id, type: 'CLICK', url: dest },
      select: { id: true },
    });
    if (!existing) {
      await prisma.newsletterEvent.create({
        data: { campaignId: rec.campaignId, recipientId: rec.id, type: 'CLICK', url: dest },
      });
    }
    return dest;
  }

  async handleResendWebhook(input: {
    rawBody: string | Buffer;
    headers: Record<string, string | string[] | undefined>;
  }) {
    const secret = newsletterConfig.webhookSecret;
    if (!secret) throw new BadRequestError('Webhook secret is not configured');

    const header = (name: string) => {
      const v = input.headers[name] ?? input.headers[name.toLowerCase()];
      return Array.isArray(v) ? v[0] : v;
    };

    const ok = verifyResendWebhookSignature({
      rawBody: input.rawBody,
      secret,
      svixId: header('svix-id'),
      svixTimestamp: header('svix-timestamp'),
      svixSignature: header('svix-signature'),
    });
    if (!ok) throw new BadRequestError('Invalid webhook signature');

    const body =
      typeof input.rawBody === 'string'
        ? JSON.parse(input.rawBody)
        : JSON.parse(input.rawBody.toString('utf8'));
    const providerEventId = String(header('svix-id') || '');
    if (!providerEventId) throw new BadRequestError('Missing svix-id');
    const type = String(body?.type || '');
    const emailId = body?.data?.email_id as string | undefined;

    try {
      await prisma.$transaction(async (tx) => {
        try {
          await tx.newsletterWebhookReceipt.create({
            data: {
              providerEventId,
              eventType: type,
              payload: body,
            },
          });
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            throw new DuplicateWebhookError();
          }
          // Non-unique DB failures must not be acknowledged as success.
          throw err;
        }

        if (!emailId) return;

        const map: Record<string, true> = {
          'email.bounced': true,
          'email.complained': true,
          'email.delivered': true,
        };
        if (!map[type]) return;

        const rec = await tx.newsletterRecipient.findFirst({ where: { providerMessageId: emailId } });
        if (!rec) {
          // Event arrived before providerMessageId persistence — park for later.
          await tx.newsletterPendingWebhook.create({
            data: {
              providerMessageId: emailId,
              providerEventId,
              eventType: type,
              payload: body,
            },
          });
          return;
        }

        await this.applyDeliveryEventInTx(tx, rec, type, providerEventId, body);
      });
    } catch (err) {
      if (err instanceof DuplicateWebhookError) {
        return { received: true, duplicate: true };
      }
      throw err;
    }

    return { received: true };
  }

  /** Admin CSV import — documented consent only; never activates suppressed/unsubscribed rows. */
  async importSubscriber(row: {
    email: string;
    firstName?: string;
    interests?: string[];
    consentAt: string;
    source: string;
  }) {
    const email = normalizeEmail(row.email);
    if (await isSuppressed(email)) throw new BadRequestError('Suppressed');
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing?.status === 'UNSUBSCRIBED' || existing?.status === 'SUPPRESSED') {
      throw new BadRequestError('Cannot import previously unsubscribed or suppressed address');
    }
    if (!row.consentAt) throw new BadRequestError('consentAt is required');
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        firstName: row.firstName,
        interests: row.interests ?? [],
        source: row.source,
        consentText: MARKETING_CONSENT_TEXT,
        consentAt: new Date(row.consentAt),
        status: 'ACTIVE',
        confirmedAt: new Date(row.consentAt),
      },
      update: {
        firstName: row.firstName,
        interests: row.interests,
        source: row.source,
        consentAt: new Date(row.consentAt),
        status: 'ACTIVE',
        confirmedAt: new Date(row.consentAt),
      },
    });
  }

  async listSubscribers(query: { search?: string; status?: string; page: number; limit: number }) {
    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [total, rows] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return { subscribers: rows, pagination: { total, page: query.page, limit: query.limit } };
  }

  async ensureMonthlyDraft() {
    const schedule = await prisma.newsletterSchedule.findFirst();
    if (!schedule?.enabled) return null;
    const monthKey = johannesburgMonthKey();
    if (schedule.lastDraftMonth === monthKey) return null;
    const exists = await prisma.newsletterCampaign.findUnique({ where: { monthKey } });
    if (exists) {
      await prisma.newsletterSchedule.update({ where: { id: schedule.id }, data: { lastDraftMonth: monthKey } });
      return null;
    }
    const title = `Monthly newsletter ${monthKey}`;
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        title,
        subject: `BretuneTech updates — ${monthKey}`,
        previewText: 'Networking, CCTV and Wi-Fi highlights from BretuneTech.',
        fromName: newsletterConfig.fromName,
        fromEmail: newsletterConfig.fromEmail,
        audience: { consentOnly: true, activity: 'all' },
        status: 'DRAFT',
        monthKey,
        blocks: [
          { type: 'hero', headline: 'BretuneTech Monthly', subhead: 'Products and services for South African networks' },
          { type: 'category', categorySlug: 'networking', limit: 4 },
          { type: 'cta', label: 'Shop networking gear', href: '/products/category/networking' },
        ],
      },
    });
    await prisma.newsletterSchedule.update({ where: { id: schedule.id }, data: { lastDraftMonth: monthKey } });
    await auditNewsletter('monthly_draft', 'campaign', campaign.id, null, { monthKey });
    return campaign;
  }
}

export const newsletterService = new NewsletterService();
