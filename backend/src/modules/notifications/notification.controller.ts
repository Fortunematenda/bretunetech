import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error-handler';
import { notificationService } from './notification.service';

const router = Router();

// GET /api/notifications - Get user notifications
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 50;
    const notifications = await notificationService.getNotifications(req.user!.userId, { unreadOnly, limit });
    res.json(notifications);
  })
);

// GET /api/notifications/unread-count - Get unread count
router.get(
  '/unread-count',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ count });
  })
);

router.get(
  '/admin-read-state',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const sourceKeys = await notificationService.getAdminReadState(req.user!.userId);
    res.json({ sourceKeys });
  })
);

router.post(
  '/admin-read-state',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const sourceKeys = Array.isArray(req.body.sourceKeys) ? req.body.sourceKeys.filter((value: unknown) => typeof value === 'string') : [];
    const result = await notificationService.markAdminNotificationsRead(req.user!.userId, sourceKeys);
    res.json(result);
  })
);

// PATCH /api/notifications/:id/read - Mark as read
router.patch(
  '/:id/read',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(req.user!.userId, String(req.params.id));
    res.json(notification);
  })
);

// PATCH /api/notifications/read-all - Mark all as read
router.patch(
  '/read-all',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    res.json(result);
  })
);

// DELETE /api/notifications/:id - Delete notification
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.deleteNotification(req.user!.userId, String(req.params.id));
    res.json(result);
  })
);

// DELETE /api/notifications - Clear all notifications
router.delete(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.clearAll(req.user!.userId);
    res.json(result);
  })
);

export default router;
