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
  updateTemplateSchema,
  createCampaignFromTemplateSchema,
  testSendSchema,
  listSubscribersSchema,
  importSubscribersSchema,
  scheduleSettingsSchema,
  scheduleCampaignSchema,
} from './newsletter.dto';
import prisma from '../../lib/prisma';
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
  '/track/open/:token.png',
  asyncHandler(async (req: Request, res: Response) => {
    const token = decodeURIComponent(String(req.params.token || ''));
    await newsletterService.recordOpen(token);
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.send(pixel);
  }),
);

router.get(
  '/track/click/:token',
  asyncHandler(async (req: Request, res: Response) => {
    const token = decodeURIComponent(String(req.params.token || ''));
    const target = await newsletterService.recordClick(token);
    if (!target) return res.status(400).json({ error: 'Invalid tracking link' });
    res.redirect(302, target);
  }),
);

router.post(
  '/unsubscribe/one-click',
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.query.id || req.body?.subscriberId || '');
    const token = String(req.query.token || req.body?.token || '');
    await newsletterService.unsubscribe({ subscriberId: id || undefined, token: token || undefined, oneClick: true });
    res.json({ unsubscribed: true });
  }),
);

router.post(
  '/webhooks/resend',
  asyncHandler(async (req: Request, res: Response) => {
    const rawBody = (req as Request & { rawBody?: Buffer | string }).rawBody;
    if (!rawBody) {
      return res.status(400).json({ error: 'Raw body required for webhook verification' });
    }
    try {
      const result = await newsletterService.handleResendWebhook({
        rawBody,
        headers: req.headers as Record<string, string | string[] | undefined>,
      });
      res.json(result);
    } catch (err: any) {
      if (err?.statusCode === 400 || /signature/i.test(String(err?.message || ''))) {
        return res.status(401).json({ error: err.message || 'Invalid webhook signature' });
      }
      throw err;
    }
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

admin.get(
  '/templates',
  requirePermission('marketing.newsletters.view'),
  asyncHandler(async (_req, res: Response) => {
    res.json({ templates: await newsletterService.listTemplates() });
  }),
);

admin.get(
  '/templates/:id',
  requirePermission('marketing.newsletters.view'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.getTemplate(req.params.id as string));
  }),
);

admin.put(
  '/templates/:id',
  requirePermission('marketing.newsletters.edit'),
  validate(updateTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.updateTemplate(req.params.id as string, req.body, req.user?.userId));
  }),
);

admin.post(
  '/templates/:id/campaign',
  requirePermission('marketing.newsletters.edit'),
  validate(createCampaignFromTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const c = await newsletterService.createCampaignFromTemplate(req.params.id as string, req.user?.userId, req.body);
    res.status(201).json(c);
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

admin.delete(
  '/campaigns/:id',
  requirePermission('marketing.newsletters.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.deleteCampaign(req.params.id as string, req.user?.userId));
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

admin.post(
  '/campaigns/:id/schedule',
  requirePermission('marketing.newsletters.send'),
  validate(scheduleCampaignSchema),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await newsletterService.scheduleCampaign(
        req.params.id as string,
        req.body.scheduledAt,
        req.user?.userId,
      ),
    );
  }),
);

admin.post(
  '/campaigns/:id/cancel',
  requirePermission('marketing.newsletters.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await newsletterService.cancelCampaign(req.params.id as string, req.user?.userId));
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