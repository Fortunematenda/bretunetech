import { mailer } from '../../lib/mailer';
import { newsletterConfig } from './newsletter.config';
import { logger } from '../../lib/logger';

const log = logger.child('NewsletterProvider');

export type SendPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
};

export type SendResult = { providerMessageId: string; mode: 'resend' | 'smtp' | 'disabled' };

/** Sends one message. Bulk sends stay off until `NEWSLETTER_SENDING_ENABLED=true`. */
export async function sendNewsletterEmail(payload: SendPayload, options?: { force?: boolean }): Promise<SendResult> {
  const isTest = payload.headers?.['X-Newsletter-Test'] === '1';
  if (!options?.force && !isTest && !newsletterConfig.sendingEnabled) {
    throw new Error('Newsletter sending is disabled (NEWSLETTER_SENDING_ENABLED is not true)');
  }

  const from = `"${newsletterConfig.fromName}" <${newsletterConfig.fromEmail}>`;

  if (newsletterConfig.provider === 'resend' && newsletterConfig.resendApiKey) {
    const body: Record<string, unknown> = {
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo || newsletterConfig.fromEmail,
      headers: payload.headers,
    };
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newsletterConfig.resendApiKey}`,
        'Content-Type': 'application/json',
        ...(payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string; id?: string };
    if (!res.ok) {
      log.error('Resend API error', { status: res.status, data });
      throw new Error(data.message || `Resend error ${res.status}`);
    }
    return { providerMessageId: String(data.id || `resend-${Date.now()}`), mode: 'resend' };
  }

  const info = await mailer.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo || newsletterConfig.fromEmail,
    headers: payload.headers,
  });
  return { providerMessageId: String(info.messageId || `smtp-${Date.now()}`), mode: 'smtp' };
}