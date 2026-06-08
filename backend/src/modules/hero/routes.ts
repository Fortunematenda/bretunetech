import { Router } from 'express';
import { heroService } from './hero.service';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateHeroSettingsSchema } from './hero.dto';

const router = Router();

// GET /api/hero/settings - Get hero settings (public)
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await heroService.getSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/hero/settings - Update hero settings (admin only)
router.put('/settings', authenticate, async (req, res, next) => {
  try {
    const settings = await heroService.updateSettings(req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// POST /api/hero/settings/reset - Reset to defaults (admin only)
router.post('/settings/reset', authenticate, async (req, res, next) => {
  try {
    const settings = await heroService.resetToDefaults();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
