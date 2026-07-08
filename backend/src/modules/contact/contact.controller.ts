import { Router, Request, Response } from 'express';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { z } from 'zod';
import { logger } from '../../lib/logger';
import nodemailer from 'nodemailer';
import prisma from '../../lib/prisma';

const log = logger.child('ContactController');

// Create SMTP transporter using environment variables
// Default: cp69.domains.co.za (Bretunetech mail server)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'cp69.domains.co.za',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465 (SSL), false for other ports
  auth: {
    user: process.env.SMTP_USER || 'sales@bretunetech.com',
    pass: process.env.SMTP_PASS, // Email account password
  },
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  service: z.string().optional(),
  budget: z.string().optional(),
  urgency: z.string().optional(),
});

const router = Router();

// POST /api/contact - Submit contact form
router.post(
  '/',
  validate(contactSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, company, message, service, budget, urgency } = req.body;

    // Log the inquiry
    log.info('Contact form submitted', { name, email, phone, company, service, budget, urgency });

    // Save to database
    try {
      await prisma.enquiry.create({
        data: { name, email, phone, company, service, budget, urgency, message },
      });
      log.info('Enquiry saved to database', { name, email });
    } catch (dbError: any) {
      log.error('Failed to save enquiry to database:', { error: dbError.message });
    }

    // Send email to sales@bretunetech.com
    try {
      const subject = service ? `Quote Request — ${service} from ${name}` : `New Enquiry from ${name}`;
      const emailBody = `
${service ? 'Quote Request' : 'New Enquiry'} from Bretunetech Website

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}${service ? `
Service: ${service}` : ''}${budget ? `
Budget: ${budget}` : ''}${urgency ? `
Timeline: ${urgency}` : ''}

Message:
${message}

---
Sent from: ${req.headers.origin || 'Bretunetech Website'}
IP: ${req.ip}
      `.trim();

      await transporter.sendMail({
        from: `"Bretunetech Website" <${process.env.SMTP_USER || 'noreply@bretunetech.com'}>`,
        to: 'sales@bretunetech.com',
        replyTo: email,
        subject,
        text: emailBody,
        html: `
          <h2>${service ? '🔧 Quote Request' : '📩 New Enquiry'} from Bretunetech Website</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Company:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${company || 'Not provided'}</td></tr>
            ${service ? `<tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Service:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color:#003d7a; font-weight:bold;">${service}</td></tr>` : ''}
            ${budget ? `<tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Budget:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${budget}</td></tr>` : ''}
            ${urgency ? `<tr><td style="padding: 8px; border: 1px solid #ddd; background:#f9f9f9;"><strong>Timeline:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${urgency}</td></tr>` : ''}
          </table>
          <h3>Message:</h3>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; max-width:600px;">${message.replace(/\n/g, '<br>')}</p>
        `,
      });

      log.info('Email sent successfully to sales@bretunetech.com');
    } catch (emailError: any) {
      log.error('Failed to send email:', { error: emailError.message });
      // Don't fail the request if email fails - still show success to user
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your enquiry. We will get back to you shortly.',
    });
  })
);

export default router;
