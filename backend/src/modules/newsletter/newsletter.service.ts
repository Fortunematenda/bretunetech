import prisma from '../../lib/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/errors';
import { MARKETING_CONSENT_TEXT, newsletterConfig } from './newsletter.config';
import { hashToken, newSubscriberToken, signUnsubscribeToken, verifyUnsubscribeToken } from './newsletter.tokens';
import { renderBlocksToHtml } from './newsletter.render';
import { sendNewsletterEmail } from './newsletter.provider';
import { auditNewsletter } from './newsletter.audit';
import type { EmailBlock, NewsletterAudience } from './newsletter.types';
import type { Prisma } from '../../../generated/prisma/client';
import { mailer } from '../../lib/mailer';

async function isSuppressed(email: string): Promise<boolean> {
  const hit = await prisma.newsletterSuppression.findUnique({ where: { email: email.toLowerCase() } });
  return Boolean(hit);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export class NewsletterService {
  async getDashboard() {
    const [subscribers, campaigns, events] = await Promise.all([
      prisma.newsletterSubscriber.groupBy({ by: ['status'], _count: true }),
      prisma.newsletterCampaign.count(),
      prisma.newsletterEvent.groupBy({ by: ['type'], _count: true }),
    ]);
    const active = subscribers.find((s) => s.status === 'ACTIVE')?._count ?? 0;
    const pending = subscribers.find((s) => s.status === 'PENDING')?._count ?? 0;
    const unsub = subscribers.find((s) => s.status === 'UNSUBSCRIBED')?._count ?? 0;
    const delivered = events.find((e) => e.type === 'DELIVERED')?._count ?? 0;
    const opens = events.find((e) => e.type === 'OPEN')?._count ?? 0;
    const clicks = events.find((e) => e.type === 'CLICK')?._count ?? 0;
    const bounces = events.find((e) => e.type === 'BOUNCE')?._count ?? 0;
    const complaints = events.find((e) => e.type === 'COMPLAINT')?._count ?? 0;
    const openRate = delivered > 0 ? Math.round((opens / delivered) * 1000) / 10 : 0;
    const clickRate = delivered > 0 ? Math.round((clicks / delivered) * 1000) / 10 : 0;
    return {
      subscribers: { active, pending, unsubscribed: unsub, suppressed: subscribers.find((s) => s.status === 'SUPPRESSED')?._count ?? 0 },
      campaigns: { total: campaigns },
      delivery: { delivered, bounces, complaints },
      engagement: { opens, clicks, openRate, clickRate, openRateNote: 'Open rates are approximate because many mail clients block tracking pixels.' },
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

    await auditNewsletter('subscribe', 'subscriber', row.id, null, { source: input.source, doubleOptIn: newsletterConfig.doubleOptIn });
    return { status: row.status, requiresConfirmation: newsletterConfig.doubleOptIn };
  }

  async confirmSubscription(token: string) {
    const hash = hashToken(token);
    const sub = await prisma.newsletterSubscriber.findFirst({ where: { confirmTokenHash: hash } });
    if (!sub) throw new NotFoundError('Subscription');
    await prisma.newsletterSubscriber.update({
      where: { id: sub.id },
      data: { status: 'ACTIVE', confirmedAt: new Date(), confirmTokenHash: null },
    });
    return { ok: true };
  }

  async unsubscribe(body: { token?: string; subscriberId?: string }) {
    if (body.subscriberId && body.token && verifyUnsubscribeToken(body.subscriberId, body.token)) {
      await this.unsubscribeSubscriber(body.subscriberId, 'one_click');
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

  private async unsubscribeSubscriber(subscriberId: string, reason: string) {
    const sub = await prisma.newsletterSubscriber.update({
      where: { id: subscriberId },
      data: { status: 'UNSUBSCRIBED', confirmTokenHash: null },
    });
    await prisma.newsletterSuppression.upsert({
      where: { email: sub.email },
      create: { email: sub.email, reason: 'unsubscribe', detail: reason },
      update: { reason: 'unsubscribe', detail: reason },
    });
    await auditNewsletter('unsubscribe', 'subscriber', sub.id, null, { reason });
  }

  async resolveAudience(audience: NewsletterAudience) {
    const rows = await prisma.newsletterSubscriber.findMany({
      where: {
        status: 'ACTIVE',
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
      if (suppressed.has(r.email)) return false;
      if (audience.activity === 'purchased') return (r.user?._count.orders ?? 0) > 0;
      if (audience.activity === 'never_purchased') return !r.user || r.user._count.orders === 0;
      return true;
    });
  }

  async listCampaigns() {
    return prisma.newsletterCampaign.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        subject: true,
        status: true,
        monthKey: true,
        scheduledAt: true,
        sentAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  async getCampaign(id: string) {
    const c = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!c) throw new NotFoundError('Campaign');
    return c;
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
    return campaign;
  }

  async updateCampaign(id: string, data: Prisma.NewsletterCampaignUpdateInput, actorId?: string) {
    const existing = await this.getCampaign(id);
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(existing.status)) {
      throw new BadRequestError('Only draft campaigns can be edited');
    }
    const campaign = await prisma.newsletterCampaign.update({ where: { id }, data });
    await auditNewsletter('update', 'campaign', id, actorId ?? null);
    return campaign;
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
    return copy;
  }

  async submitForApproval(id: string, actorId?: string) {
    const c = await this.getCampaign(id);
    if (c.status !== 'DRAFT') throw new BadRequestError('Campaign is not a draft');
    const updated = await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
    });
    await auditNewsletter('submit_approval', 'campaign', id, actorId ?? null);
    return updated;
  }

  async approveCampaign(id: string, actorId?: string) {
    const c = await this.getCampaign(id);
    if (c.status !== 'PENDING_APPROVAL') throw new BadRequestError('Campaign is not awaiting approval');
    const updated = await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: actorId },
    });
    await auditNewsletter('approve', 'campaign', id, actorId ?? null);
    return updated;
  }

  async prepareRecipients(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!['APPROVED', 'SCHEDULED'].includes(campaign.status)) {
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
    const campaign = await this.getCampaign(campaignId);
    if (!['APPROVED', 'SCHEDULED'].includes(campaign.status)) {
      throw new BadRequestError('Campaign must be approved');
    }
    await this.prepareRecipients(campaignId);
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });
    await auditNewsletter('start_send', 'campaign', campaignId, actorId ?? null);
    return { queued: true };
  }

  async sendTest(campaignId: string, to: string, actorId?: string) {
    const campaign = await this.getCampaign(campaignId);
    const blocks = campaign.blocks as EmailBlock[];
    const { html, text } = await renderBlocksToHtml(blocks, {
      unsubscribeUrl: `${newsletterConfig.siteUrl}/newsletter/unsubscribe`,
    });
    await sendNewsletterEmail(
      {
        to,
        subject: `[TEST] ${campaign.subject}`,
        html,
        text,
        headers: { 'X-Newsletter-Test': '1' },
      },
      { force: true },
    );
    await auditNewsletter('test_send', 'campaign', campaignId, actorId ?? null, { to });
    return { sent: true };
  }

  async processQueueOnce() {
    if (!newsletterConfig.workerEnabled) return { processed: 0 };
    const campaigns = await prisma.newsletterCampaign.findMany({ where: { status: 'SENDING' }, take: 3 });
    let processed = 0;
    for (const campaign of campaigns) {
      const batch = await prisma.newsletterRecipient.findMany({
        where: { campaignId: campaign.id, status: 'PENDING' },
        take: newsletterConfig.batchSize,
        include: { subscriber: true },
      });
      if (!batch.length) {
        const pending = await prisma.newsletterRecipient.count({
          where: { campaignId: campaign.id, status: { in: ['PENDING', 'QUEUED'] } },
        });
        if (pending === 0) {
          await prisma.newsletterCampaign.update({
            where: { id: campaign.id },
            data: { status: 'SENT', sentAt: new Date() },
          });
        }
        continue;
      }
      for (const rec of batch) {
        if (await isSuppressed(rec.email)) {
          await prisma.newsletterRecipient.update({
            where: { id: rec.id },
            data: { status: 'SKIPPED', lastError: 'suppressed' },
          });
          continue;
        }
        const unsubTok = signUnsubscribeToken(rec.subscriberId);
        const unsubUrl = `${newsletterConfig.siteUrl}/newsletter/unsubscribe?id=${encodeURIComponent(rec.subscriberId)}&token=${encodeURIComponent(unsubTok)}`;
        const openUrl = `${newsletterConfig.apiPublicUrl}/newsletter/track/open/${rec.id}.png`;
        const { html, text } = await renderBlocksToHtml(campaign.blocks as EmailBlock[], {
          unsubscribeUrl: unsubUrl,
          preferencesUrl: `${newsletterConfig.siteUrl}/newsletter/preferences?email=${encodeURIComponent(rec.email)}`,
          openPixelUrl: openUrl,
          recipientId: rec.id,
        });
        try {
          const result = await sendNewsletterEmail({
            to: rec.email,
            subject: campaign.subject,
            html,
            text,
            idempotencyKey: rec.idempotencyKey,
          });
          await prisma.newsletterRecipient.update({
            where: { id: rec.id },
            data: {
              status: 'SENT',
              providerMessageId: result.providerMessageId,
              sentAt: new Date(),
              attempts: { increment: 1 },
            },
          });
          await prisma.newsletterEvent.create({
            data: { campaignId: campaign.id, recipientId: rec.id, type: 'DELIVERED' },
          });
          processed++;
        } catch (err: any) {
          const attempts = rec.attempts + 1;
          await prisma.newsletterRecipient.update({
            where: { id: rec.id },
            data: {
              attempts,
              lastError: err?.message || 'send failed',
              status: attempts >= newsletterConfig.maxSendAttempts ? 'FAILED' : 'PENDING',
            },
          });
        }
      }
    }
    return { processed };
  }

  async recordOpen(recipientId: string) {
    const rec = await prisma.newsletterRecipient.findUnique({ where: { id: recipientId } });
    if (!rec) return;
    await prisma.newsletterEvent.create({
      data: { campaignId: rec.campaignId, recipientId: rec.id, type: 'OPEN' },
    });
  }

  async recordClick(recipientId: string, url: string) {
    const rec = await prisma.newsletterRecipient.findUnique({ where: { id: recipientId } });
    if (!rec) return null;
    await prisma.newsletterEvent.create({
      data: { campaignId: rec.campaignId, recipientId: rec.id, type: 'CLICK', url },
    });
    return url;
  }

  /** Admin CSV import — documented consent only; does not send confirmation mail. */
  async importSubscriber(row: {
    email: string;
    firstName?: string;
    interests?: string[];
    consentAt: string;
    source: string;
  }) {
    const email = normalizeEmail(row.email);
    if (await isSuppressed(email)) throw new BadRequestError('Suppressed');
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
    const monthKey = new Date().toISOString().slice(0, 7);
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