/** Newsletter feature flags and provider settings (never expose secrets to the client). */

export const MARKETING_CONSENT_TEXT =
  'I agree to receive marketing emails from Bretune Technologies (Pty) Ltd about products, services and offers. I can unsubscribe at any time.';

/** Source used by the legacy auto-enrolment path — ineligible for marketing until re-consent. */
export const LEGACY_AUTO_ENROLL_SOURCE = 'customer-account';

/**
 * Resend Idempotency-Key retention window (documented as 24 hours).
 * Automatic retries after this window require manual reconciliation.
 */
export const RESEND_IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  fromEmail: process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@bretunetech.com',
  fromName: process.env.NEWSLETTER_FROM_NAME || 'BretuneTech',
  provider: (process.env.NEWSLETTER_PROVIDER || 'resend') as 'resend' | 'smtp',
  smtpHost: process.env.NEWSLETTER_SMTP_HOST || process.env.SMTP_HOST || 'cp69.domains.co.za',
  smtpPort: parseInt(process.env.NEWSLETTER_SMTP_PORT || process.env.SMTP_PORT || '465', 10),
  /** Dedicated mailbox creds; falls back to shared SMTP_* only when unset (not recommended for bulk). */
  smtpUser:
    process.env.NEWSLETTER_SMTP_USER || process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@bretunetech.com',
  smtpPass: process.env.NEWSLETTER_SMTP_PASS || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET || '',
  batchSize: Math.min(200, Math.max(1, parseInt(process.env.NEWSLETTER_BATCH_SIZE || '25', 10))),
  ratePerMinute: Math.max(1, parseInt(process.env.NEWSLETTER_RATE_PER_MINUTE || '60', 10)),
  maxSendAttempts: Math.max(1, parseInt(process.env.NEWSLETTER_MAX_ATTEMPTS || '3', 10)),
};