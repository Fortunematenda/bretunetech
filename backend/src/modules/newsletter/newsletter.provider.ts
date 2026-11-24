import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
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

/** Thrown when the provider may have accepted the message but the client cannot confirm. */
export class AmbiguousSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmbiguousSendError';
  }
}

type SendImpl = (payload: SendPayload, options?: { force?: boolean }) => Promise<SendResult>;

async function defaultSendNewsletterEmail(payload: SendPayload, options?: { force?: boolean }): Promise<SendResult> {
  const isTest = payload.headers?.['X-Newsletter-Test'] === '1';
  if (!options?.force && !isTest && !newsletterConfig.sendingEnabled) {
    throw new Error('Newsletter sending is disabled (NEWSLETTER_SENDING_ENABLED is not true)');
  }

  const from = `"${newsletterConfig.fromName}" <${newsletterConfig.fromEmail}>`;
  const provider = newsletterConfig.provider;

  if (provider === 'resend') {
    if (!newsletterConfig.resendApiKey) {
      throw new Error('Newsletter provider "resend" is not configured (RESEND_API_KEY missing)');
    }
    const body: Record<string, unknown> = {
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo || newsletterConfig.fromEmail,
      headers: payload.headers,
    };
    let res: Response;
    try {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${newsletterConfig.resendApiKey}`,
          'Content-Type': 'application/json',
          ...(payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12_000),
      });
    } catch (err: any) {
      log.error('Resend request ambiguous or timed out', { err: err?.message });
      throw new AmbiguousSendError(err?.message || 'Resend request timed out');
    }
    const data = (await res.json().catch(() => ({}))) as { message?: string; id?: string };
    // Idempotent replay: treat conflict with an id as success, never blind-retry.
    if (res.status === 409 && data.id) {
      return { providerMessageId: String(data.id), mode: 'resend' };
    }
    if (!res.ok) {
      log.error('Resend API error', { status: res.status, data });
      throw new Error(data.message || `Resend error ${res.status}`);
    }
    if (!data.id) {
      throw new AmbiguousSendError('Resend accepted response without message id');
    }
    return { providerMessageId: String(data.id), mode: 'resend' };
  }

  if (provider === 'smtp') {
    if (!newsletterConfig.smtpPass || !newsletterConfig.smtpUser || !newsletterConfig.smtpHost) {
      throw new Error(
        'Newsletter provider "smtp" is not configured (NEWSLETTER_SMTP_PASS / USER / HOST required). Refusing transactional SMTP fallback.',
      );
    }
    const transport = nodemailer.createTransport({
      host: newsletterConfig.smtpHost,
      port: newsletterConfig.smtpPort,
      secure: newsletterConfig.smtpPort === 465,
      family: 4,
      name: 'bretunetech.com',
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      auth: { user: newsletterConfig.smtpUser, pass: newsletterConfig.smtpPass },
    } as SMTPTransport.Options);
    try {
      const info = await transport.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo || newsletterConfig.fromEmail,
        headers: payload.headers,
      });
      const messageId = info.messageId ? String(info.messageId) : '';
      if (!messageId) {
        throw new AmbiguousSendError('SMTP accepted without message id');
      }
      return { providerMessageId: messageId, mode: 'smtp' };
    } catch (err: any) {
      if (err instanceof AmbiguousSendError) throw err;
      // Network/timeout after DATA may mean the message was accepted — treat as ambiguous.
      const msg = String(err?.message || '');
      if (/timeout|ETIMEDOUT|ECONNRESET|socket/i.test(msg)) {
        throw new AmbiguousSendError(msg || 'SMTP delivery ambiguous');
      }
      throw err;
    } finally {
      transport.close();
    }
  }

  throw new Error(`Newsletter provider "${provider}" is not supported or not configured`);
}

let sendImpl: SendImpl = defaultSendNewsletterEmail;

/** Test-only override so integration tests can mock the provider without sending mail. */
export function setNewsletterSendImplForTests(impl: SendImpl | null) {
  sendImpl = impl || defaultSendNewsletterEmail;
}

/** Fail closed when the selected provider lacks required credentials. */
export function assertNewsletterProviderConfigured(): void {
  const provider = newsletterConfig.provider;
  if (provider === 'resend') {
    if (!newsletterConfig.resendApiKey) {
      throw new Error('Newsletter provider "resend" is not configured (RESEND_API_KEY missing)');
    }
    return;
  }
  if (provider === 'smtp') {
    if (!newsletterConfig.smtpPass || !newsletterConfig.smtpUser || !newsletterConfig.smtpHost) {
      throw new Error(
        'Newsletter provider "smtp" is not configured (NEWSLETTER_SMTP_PASS / USER / HOST required). Refusing transactional SMTP fallback.',
      );
    }
    return;
  }
  throw new Error(`Newsletter provider "${provider}" is not supported or not configured`);
}

/** Sends one message. Bulk sends stay off until `NEWSLETTER_SENDING_ENABLED=true`. */
export async function sendNewsletterEmail(payload: SendPayload, options?: { force?: boolean }): Promise<SendResult> {
  return sendImpl(payload, options);
}
