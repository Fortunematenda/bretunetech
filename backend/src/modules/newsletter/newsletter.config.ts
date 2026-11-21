/** Newsletter feature flags and provider settings (never expose secrets to the client). */

export const MARKETING_CONSENT_TEXT =
  'I agree to receive marketing emails from Bretune Technologies (Pty) Ltd about products, services and offers. I can unsubscribe at any time.';

export const newsletterConfig = {
  /** Master switch: must be `true` before any bulk send leaves the server. */
  sendingEnabled: process.env.NEWSLETTER_SENDING_ENABLED === 'true',
  /** In-process queue processor (same process as API). */
  workerEnabled: process.env.NEWSLETTER_WORKER_ENABLED === 'true',
  /** Default on for POPIA-aligned direct marketing. */
  doubleOptIn: process.env.NEWSLETTER_DOUBLE_OPT_IN !== 'false',
  siteUrl: (process.env.NEWSLETTER_SITE_URL || process.env.SITE_URL || 'https://bretunetech.com').replace(/\/$/, ''),
  apiPublicUrl:
    (process.env.NEWSLETTER_API_PUBLIC_URL || process.env.API_PUBLIC_URL || 'https://bretunetech.com/api').replace(
      /\/$/,
      '',
    ),
  fromEmail: process.env.NEWSLETTER_FROM_EMAIL || process.env.SMTP_USER || 'sales@bretunetech.com',
  fromName: process.env.NEWSLETTER_FROM_NAME || 'BretuneTech',
  provider: (process.env.NEWSLETTER_PROVIDER || 'resend') as 'resend' | 'smtp',
  resendApiKey: process.env.RESEND_API_KEY || '',
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET || '',
  batchSize: Math.min(200, Math.max(1, parseInt(process.env.NEWSLETTER_BATCH_SIZE || '25', 10))),
  ratePerMinute: Math.max(1, parseInt(process.env.NEWSLETTER_RATE_PER_MINUTE || '60', 10)),
  maxSendAttempts: Math.max(1, parseInt(process.env.NEWSLETTER_MAX_ATTEMPTS || '3', 10)),
};