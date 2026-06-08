import { Router } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createAdSchema, updateAdSchema, listAdsSchema } from './ad.dto';
import { adController } from './ad.controller';
import { adService } from './ad.service';
import { uploadImageBuffer } from '../../lib/cloudinary';
import { BadRequestError } from '../../lib/errors';
import prisma from '../../lib/prisma';

const router = Router();

// Multer config for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files (JPEG, PNG, WebP, GIF) are allowed') as any);
    }
  },
});

// Upload image endpoint
router.post('/upload-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Try Cloudinary upload first
    const uploadResult = await uploadImageBuffer(
      req.file.buffer,
      req.file.originalname,
      'bretunetech/ads'
    );

    if (uploadResult) {
      return res.json({ url: uploadResult.url });
    }

    // Fallback: convert to base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
    res.json({ url: dataUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Get active ads (public)
router.get('/active', async (req, res, next) => {
  try {
    await adController.getActiveAds(req, res);
  } catch (err) {
    next(err);
  }
});

// List all ads (admin)
router.get('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    await adController.getAllAds(req, res);
  } catch (err) {
    next(err);
  }
});

// Get ad by ID (admin)
router.get('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await adController.getAdById(req, res);
  } catch (err) {
    next(err);
  }
});

// Create ad (admin)
router.post('/', authenticate, adminOnly, validate(createAdSchema), async (req, res, next) => {
  try {
    await adController.createAd(req, res);
  } catch (err) {
    next(err);
  }
});

// Update ad (admin)
router.put('/:id', authenticate, adminOnly, validate(updateAdSchema), async (req, res, next) => {
  try {
    await adController.updateAd(req, res);
  } catch (err) {
    next(err);
  }
});

// Delete ad (admin)
router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await adController.deleteAd(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
