import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { shopSolutionsService } from './shop-solutions.service';
import { updateShopSolutionsSchema } from './shop-solutions.dto';

const router = Router();

// GET /api/shop-solutions — public (enabled cards only)
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await shopSolutionsService.getPublic();
    res.json(data);
  }),
);

// GET /api/shop-solutions/admin — full settings including disabled
router.get(
  '/admin',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await shopSolutionsService.getSettings();
    res.json(data);
  }),
);

// PUT /api/shop-solutions/admin
router.put(
  '/admin',
  authenticate,
  adminOnly,
  validate(updateShopSolutionsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await shopSolutionsService.updateSettings(req.body);
    res.json(data);
  }),
);

// POST /api/shop-solutions/admin/reset
router.post(
  '/admin/reset',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await shopSolutionsService.resetToDefaults();
    res.json(data);
  }),
);

export default router;
