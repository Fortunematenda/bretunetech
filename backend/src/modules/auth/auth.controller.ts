import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { authLimiter, registerLimiter } from '../../middleware/rate-limit';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { authService } from './auth.service';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.dto';
import { z } from 'zod';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(result);
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  validate(z.object({ refreshToken: z.string().min(1) })),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refreshTokens(req.body.refreshToken);
    res.json(result);
  })
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user!.userId);
    res.json(user);
  })
);

// PUT /api/auth/me
router.put(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  })
);

export default router;
