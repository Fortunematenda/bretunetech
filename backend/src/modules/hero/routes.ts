import { Router } from 'express';
import { heroService } from './hero.service';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateHeroSettingsSchema } from './hero.dto';
import multer from 'multer';
import { uploadImageBuffer } from '../../lib/cloudinary';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed') as any);
  },
});

const router = Router();

// POST /api/hero/upload-image - Upload hero background image (admin only)
router.post('/upload-image', authenticate, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, 'bretunetech/hero');
    if (result) {
      return res.json({ url: result.url });
    }
    res.status(500).json({ error: 'Failed to upload image' });
  } catch (err) {
    next(err);
  }
});

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
