import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { adminService } from './admin.service';
import { updateOrderStatusSchema, listOrdersQuerySchema } from '../orders/order.dto';
import { generateInvoicePDF } from '../../lib/pdf-generator';
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

// GET /api/admin/orders/:id/invoice - Generate PDF invoice
router.get(
  '/orders/:id/invoice',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.getOrderById(req.params.id as string);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow invoice generation for paid/processed orders
    if (order.status !== 'PAID' && order.status !== 'PROCESSING' && order.status !== 'SHIPPED' && order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Invoice can only be generated for paid or processed orders' });
    }

    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt),
      customer: {
        name: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
        email: order.user?.email || '',
        phone: order.user?.phone,
      },
      address: order.address ? {
        street: order.address.street,
        city: order.address.city,
        province: order.address.province,
        postalCode: order.address.postalCode,
      } : undefined,
      items: order.items?.map((item: any) => ({
        name: item.name || item.product?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.price,
      })) || [],
      subtotal: order.subtotal || 0,
      shippingCost: order.shippingCost || 0,
      total: order.totalPrice || 0,
      status: order.status,
      paymentMethod: order.paymentMethod || 'EFT',
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  })
);

export default router;
