import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { strictLimiter } from '../../middleware/rate-limit';
import { orderService } from './order.service';
import { createOrderSchema, updateOrderStatusSchema, listOrdersQuerySchema } from './order.dto';

const router = Router();

// POST /api/orders - Create order from cart (with stock locking + idempotency)
router.post(
  '/',
  authenticate,
  strictLimiter,
  validate(createOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.user!.userId, req.body);
    res.status(201).json(order);
  })
);

// GET /api/orders - Customer orders
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await orderService.getCustomerOrders(req.user!.userId);
    res.json(orders);
  })
);

// GET /api/orders/:id
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(
      req.params.id as string,
      req.user!.userId,
      req.user!.role
    );
    res.json(order);
  })
);

// GET /api/orders/:id/whatsapp
router.get(
  '/:id/whatsapp',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.generateWhatsAppMessage(
      req.params.id as string,
      req.user!.userId
    );
    res.json(result);
  })
);

export default router;
