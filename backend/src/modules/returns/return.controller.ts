import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { authenticate, adminOnly } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error-handler';

const router = Router();

// ─── Customer Routes ───────────────────────────────────

// POST /api/returns - Create a return request (customer)
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const { orderId, items, requestedResolution, customerReason, customerComment } = req.body;

    if (!userId) return res.status(401).json({ error: 'User not authenticated' });
    if (!orderId || !items?.length || !requestedResolution || !customerReason) {
      return res.status(400).json({ error: 'orderId, items, requestedResolution, and customerReason are required' });
    }

    // Validate order belongs to user and is in a returnable status
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { returnItems: true } } },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!['COMPLETED', 'SHIPPED'].includes(order.status)) {
      return res.status(400).json({ error: 'Returns can only be requested for completed or shipped orders' });
    }

    // Validate items and quantities
    let totalReturnValue = 0;
    const returnItems: { orderItemId: string; productId: string | null; quantity: number; unitPrice: number; total: number; reason: string }[] = [];

    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem) return res.status(400).json({ error: `Order item ${item.orderItemId} not found` });

      // Calculate already returned quantity
      const alreadyReturned = orderItem.returnItems?.reduce((sum: number, ri: any) => sum + ri.quantity, 0) || 0;
      const maxReturnable = orderItem.quantity - alreadyReturned;

      if (item.quantity <= 0 || item.quantity > maxReturnable) {
        return res.status(400).json({ error: `Invalid return quantity for "${orderItem.name}". Max returnable: ${maxReturnable}` });
      }

      const itemTotal = orderItem.price * item.quantity;
      totalReturnValue += itemTotal;

      returnItems.push({
        orderItemId: orderItem.id,
        productId: orderItem.productId,
        quantity: item.quantity,
        unitPrice: orderItem.price,
        total: itemTotal,
        reason: item.reason || customerReason,
      });
    }

    // Generate return number
    const count = await prisma.returnRequest.count();
    const returnNumber = `RMA-${String(count + 1).padStart(5, '0')}`;

    const returnRequest = await prisma.returnRequest.create({
      data: {
        returnNumber,
        orderId,
        customerId: userId,
        requestedResolution,
        customerReason,
        customerComment: customerComment || null,
        totalReturnValue,
        items: { create: returnItems },
        statusHistory: {
          create: {
            oldStatus: 'REQUESTED',
            newStatus: 'REQUESTED',
            note: 'Return request submitted by customer',
          },
        },
      },
      include: {
        items: { include: { orderItem: true, product: true } },
        order: { select: { orderNumber: true } },
      },
    });

    res.status(201).json(returnRequest);
  })
);

// GET /api/returns - Get customer's return requests
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    const returns = await prisma.returnRequest.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: { select: { url: true }, take: 1 } } },
            orderItem: { select: { name: true } },
          },
        },
      },
    });

    res.json(returns);
  })
);

// GET /api/returns/:id - Get single return (customer)
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    const retId = req.params.id as string;
    const ret = await prisma.returnRequest.findFirst({
      where: { id: retId, customerId: userId },
      include: {
        order: { select: { id: true, orderNumber: true, createdAt: true, totalPrice: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: { select: { url: true }, take: 1 } } },
            orderItem: { select: { name: true, quantity: true, price: true } },
          },
        },
        attachments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!ret) return res.status(404).json({ error: 'Return request not found' });
    res.json(ret);
  })
);

// ─── Admin Routes ──────────────────────────────────────

// GET /api/returns/admin/all - Get all return requests (admin)
router.get(
  '/admin/all',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const resolution = req.query.resolution as string | undefined;
    const where: any = {};

    if (status && status !== 'ALL') where.status = status;
    if (resolution && resolution !== 'ALL') where.requestedResolution = resolution;
    if (search) {
      where.OR = [
        { returnNumber: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const returns = await prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: { select: { url: true }, take: 1 } } },
            orderItem: { select: { name: true } },
          },
        },
        _count: { select: { items: true } },
      },
    });

    res.json(returns);
  })
);

// GET /api/returns/admin/:id - Get single return (admin)
router.get(
  '/admin/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const retId = req.params.id as string;
    const ret = await prisma.returnRequest.findUnique({
      where: { id: retId },
      include: {
        order: {
          select: { id: true, orderNumber: true, createdAt: true, totalPrice: true, status: true, paymentMethod: true },
        },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, images: { select: { url: true }, take: 1 } } },
            orderItem: { select: { name: true, quantity: true, price: true } },
          },
        },
        attachments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!ret) return res.status(404).json({ error: 'Return request not found' });
    res.json(ret);
  })
);

// PUT /api/returns/admin/:id/status - Update return status (admin)
router.put(
  '/admin/:id/status',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { status, note, customerVisibleNote, adminNote } = req.body;
    const adminId = (req as any).user.userId;
    const retId = req.params.id as string;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const existing = await prisma.returnRequest.findUnique({ where: { id: retId } });
    if (!existing) return res.status(404).json({ error: 'Return request not found' });

    const data: any = {
      status,
      ...(adminNote !== undefined && { adminNote }),
      ...(customerVisibleNote !== undefined && { customerVisibleNote }),
    };

    if (status === 'COMPLETED') data.completedAt = new Date();

    const updated = await prisma.returnRequest.update({
      where: { id: retId },
      data: {
        ...data,
        statusHistory: {
          create: {
            oldStatus: existing.status,
            newStatus: status,
            note: note || null,
            changedByAdminId: adminId,
          },
        },
      },
      include: {
        order: { select: { orderNumber: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: true, orderItem: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    res.json(updated);
  })
);

// PUT /api/returns/admin/:id/note - Add admin note
router.put(
  '/admin/:id/note',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { adminNote, customerVisibleNote } = req.body;

    const retId = req.params.id as string;
    const updated = await prisma.returnRequest.update({
      where: { id: retId },
      data: {
        ...(adminNote !== undefined && { adminNote }),
        ...(customerVisibleNote !== undefined && { customerVisibleNote }),
      },
    });

    res.json(updated);
  })
);

export default router;
