import { Router } from 'express';
import { z } from 'zod';
import { InvoiceService } from './invoice.service';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();
const service = new InvoiceService();

// Create invoice
const createSchema = z.object({
  body: z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    items: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
      total: z.number().min(0),
    })).min(1),
    subtotal: z.number().min(0),
    vatAmount: z.number().min(0).default(0),
    total: z.number().min(0),
    dueDate: z.string().datetime(),
    notes: z.string().optional(),
    orderId: z.string().optional(),
  }),
});

router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  validate(createSchema),
  async (req, res, next) => {
    try {
      const invoice = await service.create(req.body);
      res.status(201).json(invoice);
    } catch (err) {
      next(err);
    }
  }
);

// List invoices
const listQuerySchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    page: z.string().default('1'),
    limit: z.string().default('20'),
  }),
});

router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  validate(listQuerySchema),
  async (req, res, next) => {
    try {
      const result = await service.list({
        status: req.query.status as any,
        page: parseInt(req.query.page as string),
        limit: parseInt(req.query.limit as string),
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// Get invoice by ID
router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  async (req, res, next) => {
    try {
      const invoice = await service.getById(req.params.id as string);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  }
);

// Update invoice status
const updateSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    amountPaid: z.number().min(0).optional(),
    paymentMethod: z.enum(['EFT', 'PAYFAST', 'YOCO', 'OZOW', 'WHATSAPP']).optional(),
    paymentRef: z.string().optional(),
    notes: z.string().optional(),
  }),
});

router.patch(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const invoice = await service.update(req.params.id as string, req.body);
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  }
);

// Delete invoice
router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res, next) => {
    try {
      await service.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// Get invoice stats
router.get(
  '/stats/overview',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  async (req, res, next) => {
    try {
      const stats = await service.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

export const invoiceRouter = router;
