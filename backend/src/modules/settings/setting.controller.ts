import { Router } from 'express';
import { z } from 'zod';
import { SettingService } from './setting.service';
import { authenticate, requireRole } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = Router();
const service = new SettingService();

// Get all settings (admin only)
router.get(
  '/',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res, next) => {
    try {
      const settings = await service.list();
      res.json(settings);
    } catch (err) {
      next(err);
    }
  }
);

// Get public settings (no auth required)
router.get(
  '/public',
  async (req, res, next) => {
    try {
      const settings = await service.getPublic();
      res.json(settings);
    } catch (err) {
      next(err);
    }
  }
);

// Get setting by key
router.get(
  '/:key',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res, next) => {
    try {
      const setting = await service.getByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.json(setting);
    } catch (err) {
      next(err);
    }
  }
);

// Create or update setting
const upsertSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    value: z.string(),
    group: z.string().default('general'),
    description: z.string().optional(),
    isPublic: z.boolean().default(false),
  }),
});

router.post(
  '/',
  authenticate,
  requireRole(['ADMIN']),
  validate(upsertSchema),
  async (req, res, next) => {
    try {
      const setting = await service.upsert(req.body);
      res.json(setting);
    } catch (err) {
      next(err);
    }
  }
);

// Update setting by key
router.patch(
  '/:key',
  authenticate,
  requireRole(['ADMIN']),
  validate(z.object({ body: z.object({ value: z.string() }) })),
  async (req, res, next) => {
    try {
      const setting = await service.update(req.params.key, req.body.value);
      res.json(setting);
    } catch (err) {
      next(err);
    }
  }
);

// Delete setting
router.delete(
  '/:key',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res, next) => {
    try {
      await service.delete(req.params.key);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export const settingRouter = router;
