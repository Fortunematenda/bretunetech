import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { adminService } from './admin.service';
import { updateOrderStatusSchema, listOrdersQuerySchema } from '../orders/order.dto';
import { z } from 'zod';

const router = Router();

// GET /api/admin/stats - Dashboard statistics with monthly revenue
router.get(
  '/stats',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  })
);

// GET /api/admin/orders - All orders with date range filtering
router.get(
  '/orders',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getAllOrders({
      status: req.query.status as string | undefined,
      page: (req.query.page as string) || '1',
      limit: (req.query.limit as string) || '20',
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    res.json(result);
  })
);

// PUT /api/admin/orders/:id/status - Update order status (restores stock on cancel)
router.put(
  '/orders/:id/status',
  authenticate,
  adminOnly,
  validate(updateOrderStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.updateOrderStatus(req.params.id as string, req.body.status);
    res.json(order);
  })
);

// GET /api/admin/inventory
router.get(
  '/inventory',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const inventory = await adminService.getInventory({
      lowStock: req.query.lowStock as string | undefined,
      supplier: req.query.supplier as string | undefined,
    });
    res.json(inventory);
  })
);

// GET /api/admin/analytics/best-sellers
router.get(
  '/analytics/best-sellers',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const bestSellers = await adminService.getBestSellers();
    res.json(bestSellers);
  })
);

// GET /api/admin/analytics/revenue - Revenue by date range
router.get(
  '/analytics/revenue',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const from = (req.query.from as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = (req.query.to as string) || new Date().toISOString();
    const result = await adminService.getRevenueByDateRange(from, to);
    res.json(result);
  })
);

// POST /api/admin/products/bulk - Bulk update products
router.post(
  '/products/bulk',
  authenticate,
  adminOnly,
  validate(z.object({
    productIds: z.array(z.string().uuid()).min(1),
    action: z.enum(['activate', 'deactivate', 'feature', 'unfeature']),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { productIds, action } = req.body;
    const data: any = {};
    if (action === 'activate') data.isActive = true;
    if (action === 'deactivate') data.isActive = false;
    if (action === 'feature') data.isFeatured = true;
    if (action === 'unfeature') data.isFeatured = false;
    const result = await adminService.bulkUpdateProducts(productIds, data);
    res.json(result);
  })
);

// GET /api/admin/customers - List all customers with order stats
router.get(
  '/customers',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const customers = await adminService.getCustomers();
    res.json(customers);
  })
);

// GET /api/admin/shipping - Get shipping settings
router.get(
  '/shipping',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await adminService.getShippingSettings();
    res.json(settings);
  })
);

// PUT /api/admin/shipping - Update shipping settings
router.put(
  '/shipping',
  authenticate,
  adminOnly,
  validate(z.object({
    standardFee: z.number().min(0),
    freeShippingThreshold: z.number().min(0),
    enableFreeShipping: z.boolean(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await adminService.updateShippingSettings(req.body);
    res.json(settings);
  })
);

export default router;
