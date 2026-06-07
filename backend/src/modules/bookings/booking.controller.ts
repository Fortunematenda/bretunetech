import { Router } from 'express';
import { z } from 'zod';
import { BookingService } from './booking.service';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();
const service = new BookingService();

// Create booking (public - no auth required for guest bookings)
const createSchema = z.object({
  body: z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(10),
    company: z.string().optional(),
    serviceType: z.enum(['WIFI_INSTALLATION', 'FIBRE_INSTALLATION', 'CCTV_SETUP', 'MIKROTIK_CONFIGURATION', 'REMOTE_SUPPORT', 'NETWORK_TROUBLESHOOTING']),
    address: z.string().min(5),
    city: z.string().min(2),
    province: z.string().min(2),
    postalCode: z.string().min(4),
    preferredDate: z.string().datetime().optional(),
    description: z.string().optional(),
  }),
});

router.post(
  '/',
  validate(createSchema),
  async (req, res, next) => {
    try {
      const booking = await service.create(req.body);
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  }
);

// Get all bookings (admin/staff only)
const listQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    serviceType: z.enum(['WIFI_INSTALLATION', 'FIBRE_INSTALLATION', 'CCTV_SETUP', 'MIKROTIK_CONFIGURATION', 'REMOTE_SUPPORT', 'NETWORK_TROUBLESHOOTING']).optional(),
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
        serviceType: req.query.serviceType as any,
        page: parseInt(req.query.page as string),
        limit: parseInt(req.query.limit as string),
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// Get booking by ID
router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  async (req, res, next) => {
    try {
      const booking = await service.getById(req.params.id as string);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (err) {
      next(err);
    }
  }
);

// Update booking status
const updateSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    scheduledDate: z.string().datetime().optional(),
    scheduledTime: z.string().optional(),
    technicianId: z.string().optional(),
    technicianName: z.string().optional(),
    estimatedCost: z.number().optional(),
    finalCost: z.number().optional(),
    internalNotes: z.string().optional(),
  }),
});

router.patch(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const booking = await service.update(req.params.id as string, req.body);
      res.json(booking);
    } catch (err) {
      next(err);
    }
  }
);

// Delete booking
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

export const bookingRouter = router;
