import { Router } from 'express';
import { z } from 'zod';
import { BookingService } from './booking.service';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
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
const service = new BookingService();

// Create booking (public - no auth required for guest bookings)
const createSchema = z.object({
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
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  serviceType: z.enum(['WIFI_INSTALLATION', 'FIBRE_INSTALLATION', 'CCTV_SETUP', 'MIKROTIK_CONFIGURATION', 'REMOTE_SUPPORT', 'NETWORK_TROUBLESHOOTING']).optional(),
  page: z.string().default('1'),
  limit: z.string().default('20'),
});

router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  validate(listQuerySchema, 'query'),
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
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledDate: z.string().datetime().optional(),
  scheduledTime: z.string().optional(),
  technicianId: z.string().optional(),
  technicianName: z.string().optional(),
  estimatedCost: z.number().optional(),
  finalCost: z.number().optional(),
  internalNotes: z.string().optional(),
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

// POST /:id/reply - Send email reply to customer via SMTP
router.post(
  '/:id/reply',
  authenticate,
  requireRole(['ADMIN', 'STAFF']),
  async (req, res, next) => {
    try {
      const { subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required' });
      }

      const booking = await service.getById(req.params.id as string);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      await mailer.sendMail({
        from: `"Bretunetech" <${process.env.SMTP_USER || 'sales@bretunetech.com'}>`,
        to: booking.customerEmail,
        replyTo: process.env.SMTP_USER || 'sales@bretunetech.com',
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #003d7a; padding: 20px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0; font-size: 18px;">Bretunetech</h2>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; margin: 0 0 16px;">Hi ${booking.customerName},</p>
              <div style="white-space: pre-wrap; color: #374151; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <p style="color:#6b7280;font-size:12px;margin:0;">
                Booking Reference: <strong>${booking.bookingNumber}</strong><br/>
                Service: <strong>${booking.serviceType?.replace(/_/g, ' ')}</strong>
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Bretunetech · sales@bretunetech.com<br>
                This email is regarding your service booking.
              </p>
            </div>
          </div>
        `,
        text: `Hi ${booking.customerName},\n\n${message}\n\n---\nBooking Ref: ${booking.bookingNumber}\nService: ${booking.serviceType}\n\nBretunetech\nsales@bretunetech.com`,
      });

      const updated = await service.update(req.params.id as string, {
        status: 'CONFIRMED',
        emailSentAt: new Date().toISOString(),
        emailCount: (booking.emailCount || 0) + 1,
      });
      res.json({ success: true, booking: updated });
    } catch (err) {
      next(err);
    }
  }
);

export const bookingRouter = router;
