import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { authLimiter, registerLimiter } from '../../middleware/rate-limit';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { authService } from './auth.service';
import { registerSchema, loginSchema, updateProfileSchema, createAdminSchema } from './auth.dto';
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

// POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  validate(z.object({ email: z.string().email() })),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resendOtp(req.body.email);
    res.json(result);
  })
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  validate(z.object({ email: z.string().email(), otp: z.string().length(6) })),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOtp(req.body.email, req.body.otp);
    res.json(result);
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

// POST /api/auth/admin - Create admin user (SUPER_ADMIN only)
router.post(
  '/admin',
  authenticate,
  validate(createAdminSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.createAdmin(req.body, req.user!.role);
    res.status(201).json(user);
  })
);

// GET /api/auth/admin - Get all admin users (SUPER_ADMIN only)
router.get(
  '/admin',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const users = await authService.getAdminUsers(req.user!.role);
    res.json(users);
  })
);

// DELETE /api/auth/admin/:id - Delete admin user (SUPER_ADMIN only)
router.delete(
  '/admin/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.deleteAdminUser(req.params.id as string, req.user!.role);
    res.json(result);
  })
);

export default router;
