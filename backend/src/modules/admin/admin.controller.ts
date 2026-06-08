import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { adminService } from './admin.service';
import { updateOrderStatusSchema, listOrdersQuerySchema } from '../orders/order.dto';
import { generateInvoicePDF } from '../../lib/pdf-generator';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import nodemailer from 'nodemailer';

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'cp69.domains.co.za',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'sales@bretunetech.com',
    pass: process.env.SMTP_PASS,
  },
});

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

    // Allow invoice generation for all orders except CANCELLED
    if (order.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Invoice cannot be generated for cancelled orders' });
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

// GET /api/admin/enquiries - List all enquiries
router.get(
  '/enquiries',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status;

    const [enquiries, total] = await Promise.all([
      (prisma as any).enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      (prisma as any).enquiry.count({ where }),
    ]);

    res.json({
      enquiries,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  })
);

// PATCH /api/admin/enquiries/:id - Update enquiry status or notes
router.patch(
  '/enquiries/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { status, notes } = req.body;
    const updated = await (prisma as any).enquiry.update({
      where: { id: req.params.id },
      data: { ...(status && { status }), ...(notes !== undefined && { notes }) },
    });
    res.json(updated);
  })
);

// POST /api/admin/enquiries/:id/reply - Send email reply to customer
router.post(
  '/enquiries/:id/reply',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const enquiry = await (prisma as any).enquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });

    await mailer.sendMail({
      from: `"Bretunetech" <${process.env.SMTP_USER || 'sales@bretunetech.com'}>`,
      to: enquiry.email,
      replyTo: process.env.SMTP_USER || 'sales@bretunetech.com',
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #003d7a; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; font-size: 18px;">Bretunetech</h2>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; margin: 0 0 16px;">Hi ${enquiry.name},</p>
            <div style="white-space: pre-wrap; color: #374151; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
          </div>
          <div style="background: #f3f4f6; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Bretunetech · sales@bretunetech.com<br>
              This email is in response to your enquiry submitted on our website.
            </p>
          </div>
        </div>
      `,
      text: `Hi ${enquiry.name},\n\n${message}\n\n---\nBretunetech\nsales@bretunetech.com`,
    });

    const updated = await (prisma as any).enquiry.update({
      where: { id: req.params.id },
      data: { status: 'REPLIED' },
    });

    res.json({ success: true, enquiry: updated });
  })
);

export default router;
