import { Router, Request, Response } from 'express';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { z } from 'zod';
import { logger } from '../../lib/logger';
import nodemailer from 'nodemailer';

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
});

const router = Router();

// POST /api/contact - Submit contact form
router.post(
  '/',
  validate(contactSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, company, message, service } = req.body;

    // Log the inquiry
    log.info('Contact form submitted', { name, email, phone, company, service });

    // Send email to sales@bretunetech.com
    try {
      const emailBody = `
New Enquiry from Bretunetech Website

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}

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
        subject: `New Enquiry from ${name}`,
        text: emailBody,
        html: `
          <h2>New Enquiry from Bretunetech Website</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${company || 'Not provided'}</td></tr>
          </table>
          <h3>Message:</h3>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
        `,
      });

      log.info('Email sent successfully to sales@bretunetech.com');
    } catch (emailError: any) {
      log.error('Failed to send email:', emailError.message);
      // Don't fail the request if email fails - still show success to user
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your enquiry. We will get back to you shortly.',
    });
  })
);

export default router;
