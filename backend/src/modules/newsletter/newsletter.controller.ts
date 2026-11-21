import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { newsletterService } from './newsletter.service';
import {
  subscribeSchema,
  unsubscribeSchema,
  createCampaignSchema,
  updateCampaignSchema,
  testSendSchema,
  listSubscribersSchema,
  importSubscribersSchema,
  scheduleSettingsSchema,
} from './newsletter.dto';
import prisma from '../../lib/prisma';
import { newsletterConfig } from './newsletter.config';
import { auditNewsletter } from './newsletter.audit';
import { strictLimiter } from '../../middleware/rate-limit';

const router = Router();

// ─── Public ────────────────────────────────────────────
router.post(
  '/subscribe',
  strictLimiter,
  validate(subscribeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const result = await newsletterService.subscribe({
      email: req.body.email,
      firstName: req.body.firstName,
      interests: req.body.interests,
      source: req.body.source,
      consentIp: ip,
    });
    res.status(201).json(result);
  }),
);

router.get(
  '/confirm',
  asyncHandler(async (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).json({ error: 'Missing token' });
    await newsletterService.confirmSubscription(token);
    res.json({ confirmed: true });
  }),
);

router.post(
  '/unsubscribe',
  validate(unsubscribeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await newsletterService.unsubscribe(req.body);
    res.json({ unsubscribed: true });
  }),
);

router.get(
  '/track/open/:recipientId.png',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.recipientId as string;
    await newsletterService.recordOpen(id);
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.send(pixel);
  }),
);

router.get(
  '/track/click/:recipientId',
  asyncHandler(async (req: Request, res: Response) => {
    const url = String(req.query.url || newsletterConfig.siteUrl);
    const target = await newsletterService.recordClick(req.params.recipientId as string, url);
    res.redirect(302, target || url);
  }),
);

router.post(
  '/webhooks/resend',
  asyncHandler(async (req: Request, res: Response) => {
    const secret = newsletterConfig.webhookSecret;
    if (secret && req.headers['x-resend-signature'] !== secret) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    const type = req.body?.type;
    const emailId = req.body?.data?.email_id;
    if (emailId) {
      const rec = await prisma.newsletterRecipient.findFirst({ where: { providerMessageId: emailId } });
      if (rec) {
        const map: Record<string, 'BOUNCE' | 'COMPLAINT' | 'DELIVERED'> = {
          'email.bounced': 'BOUNCE',
          'email.complained': 'COMPLAINT',
          'email.delivered': 'DELIVERED',
        };
        const evt = map[type];
        if (evt) {
          await prisma.newsletterEvent.create({
            data: { campaignId: rec.campaignId, recipientId: rec.id, type: evt, metadata: req.body },
          });
          if (evt === 'BOUNCE') await prisma.newsletterRecipient.update({ where: { id: rec.id }, data: { status: 'BOUNCED' } });
          if (evt === 'COMPLAINT') {
            await prisma.newsletterRecipient.update({ where: { id: rec.id }, data: { status: 'COMPLAINT' } });
            await prisma.newsletterSuppression.upsert({
              where: { email: rec.email },
              create: { email: rec.email, reason: 'complaint' },
              update: { reason: 'complaint' },
            });
          }
        }
      }
    }
    res.json({ received: true });
  }),
);

const admin = Router();
admin.use(authenticate);

admin.get(
  '/dashboard',
  requirePermission('marketing.newsletters.view'),
  asyncHandler(async (_req, res: Response) => {
    res.json(await newsletterService.getDashboard());
  }),
);

admin.get(
  '/campaigns',
  requirePermission('marketing.newsletters.view'),
  asyncHandler(async (_req, res: Response) => {
    res.json({ campaigns: await newsletterService.listCampaigns() });
  }),
);

admin.post(
  '/campaigns',
  requirePermission('marketing.newsletters.edit'),
  validate(createCampaignSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const c = await newsletterService.createCampaign(
      {
        title: req.body.title,
        subject: req.body.subject,
        previewText: req.body.previewText || '',
        fromName: req.body.fromName,
        fromEmail: req.body.fromEmail,
        audience: req.body.audience,
        blocks: req.body.blocks,
        monthKey: req.body.monthKey,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      },
      req.user?.userId,
    );
    res.status(201).json(c);
  }),
);

admin.get(
  '/campaigns/:id',
  requirePermission('marketing.newsletters.view'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.getCampaign(req.params.id as string));
  }),
);

admin.put(
  '/campaigns/:id',
  requirePermission('marketing.newsletters.edit'),
  validate(updateCampaignSchema),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.updateCampaign(req.params.id as string, req.body, req.user?.userId));
  }),
);

admin.post(
  '/campaigns/:id/duplicate',
  requirePermission('marketing.newsletters.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.duplicateCampaign(req.params.id as string, req.user?.userId));
  }),
);

admin.post(
  '/campaigns/:id/submit',
  requirePermission('marketing.newsletters.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.submitForApproval(req.params.id as string, req.user?.userId));
  }),
);

admin.post(
  '/campaigns/:id/approve',
  requirePermission('marketing.newsletters.send'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.approveCampaign(req.params.id as string, req.user?.userId));
  }),
);

admin.post(
  '/campaigns/:id/test-send',
  requirePermission('marketing.newsletters.send'),
  validate(testSendSchema),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.sendTest(req.params.id as string, req.body.email, req.user?.userId));
  }),
);

admin.post(
  '/campaigns/:id/start',
  requirePermission('marketing.newsletters.send'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.startSending(req.params.id as string, req.user?.userId));
  }),
);

admin.get(
  '/subscribers',
  requirePermission('marketing.newsletters.subscribers'),
  validate(listSubscribersSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.listSubscribers(req.query as any));
  }),
);

admin.post(
  '/subscribers/import',
  requirePermission('marketing.newsletters.subscribers'),
  validate(importSubscribersSchema),
  asyncHandler(async (req: Request, res: Response) => {
    let imported = 0;
    for (const row of req.body.rows) {
      try {
        await newsletterService.importSubscriber({
          email: row.email,
          firstName: row.firstName,
          interests: row.interests,
          consentAt: row.consentAt,
          source: row.source || 'import',
        });
        imported++;
      } catch {
        /* skip invalid / duplicate */
      }
    }
    await auditNewsletter('import', 'subscriber', null, req.user?.userId, { imported });
    res.json({ imported });
  }),
);

admin.get(
  '/schedule',
  requirePermission('marketing.newsletters.view'),
  asyncHandler(async (_req, res: Response) => {
    let row = await prisma.newsletterSchedule.findFirst();
    if (!row) {
      row = await prisma.newsletterSchedule.create({
        data: { name: 'Monthly BretuneTech newsletter', enabled: false },
      });
    }
    res.json(row);
  }),
);

admin.put(
  '/schedule',
  requirePermission('marketing.newsletters.edit'),
  validate(scheduleSettingsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    let row = await prisma.newsletterSchedule.findFirst();
    if (!row) {
      row = await prisma.newsletterSchedule.create({ data: { name: 'Monthly BretuneTech newsletter', ...req.body } });
    } else {
      row = await prisma.newsletterSchedule.update({ where: { id: row.id }, data: req.body });
    }
    await auditNewsletter('schedule_update', 'schedule', row.id, req.user?.userId, req.body);
    res.json(row);
  }),
);

router.use('/admin', admin);

export default router;