import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { strictLimiter } from '../../middleware/rate-limit';
import { orderService } from './order.service';
import { createOrderSchema, updateOrderStatusSchema, listOrdersQuerySchema } from './order.dto';
import { generateInvoicePDF } from '../../lib/pdf-generator';
import prisma from '../../lib/prisma';

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

// GET /api/orders/:id/invoice - Customer invoice download
router.get(
  '/:id/invoice',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const orderId = req.params.id as string;
    
    // Get order and verify it belongs to the user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        address: true,
        items: { include: { product: true } },
      },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Allow invoice generation for all orders except CANCELLED
    if (order.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Invoice cannot be generated for cancelled orders' });
    }

    // Get business settings for bank details and company info
    const { adminService } = await import('../admin/admin.service');
    const businessSettings = await adminService.getBusinessSettings();

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
      bankDetails: order.paymentMethod === 'EFT' ? {
        bankName: businessSettings.bankName,
        accountHolder: businessSettings.accountHolder,
        accountNumber: businessSettings.accountNumber,
        accountType: businessSettings.accountType,
        branchCode: businessSettings.branchCode,
      } : undefined,
      company: {
        brandName: businessSettings.name,
        legalName: businessSettings.legalName,
        registrationNumber: businessSettings.registrationNumber,
        taxNumber: businessSettings.taxNumber,
        website: businessSettings.website,
        email: businessSettings.email,
        supportEmail: businessSettings.supportEmail,
        country: businessSettings.country,
        businessType: businessSettings.businessType,
      },
    };

    try {
      const pdfBuffer = await generateInvoicePDF(invoiceData);
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res.status(500).json({ error: 'Failed to generate invoice PDF' });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Invoice generation error:', error);
      return res.status(500).json({ error: 'Failed to generate invoice PDF' });
    }
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

export default router;
