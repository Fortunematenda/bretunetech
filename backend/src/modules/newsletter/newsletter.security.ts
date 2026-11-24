import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { newsletterConfig } from './newsletter.config';

const tokenSecret = () =>
  process.env.NEWSLETTER_TOKEN_SECRET || process.env.JWT_SECRET || 'newsletter-dev-secret';

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function fromB64url(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

export function signPayload(payload: string): string {
  return b64url(createHmac('sha256', tokenSecret()).update(payload).digest());
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

/** Tracking token for open: `recipientId.open.exp.sig` */
/** Tracking token for click: `recipientId.click.exp.destB64.sig` */
export function signTrackingToken(input: {
  recipientId: string;
  purpose: 'open' | 'click';
  destination?: string;
  ttlSeconds?: number;
}): string {
  const exp = Math.floor(Date.now() / 1000) + (input.ttlSeconds ?? 60 * 60 * 24 * 90);
  if (input.purpose === 'open') {
    const body = `${input.recipientId}.open.${exp}`;
    return `${body}.${signPayload(body)}`;
  }
  const dest = b64url(Buffer.from(input.destination || '', 'utf8'));
  const body = `${input.recipientId}.click.${exp}.${dest}`;
  return `${body}.${signPayload(body)}`;
}

export function verifyTrackingToken(
  token: string,
  purpose: 'open' | 'click',
): { recipientId: string; destination?: string } | null {
  const parts = token.split('.');
  if (purpose === 'open') {
    if (parts.length !== 4) return null;
    const [recipientId, tokPurpose, expStr, sig] = parts;
    if (!recipientId || tokPurpose !== 'open') return null;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    const body = `${recipientId}.open.${expStr}`;
    if (!safeEqual(sig, signPayload(body))) return null;
    return { recipientId };
  }
  if (parts.length !== 5) return null;
  const [recipientId, tokPurpose, expStr, dest, sig] = parts;
  if (!recipientId || tokPurpose !== 'click') return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  const body = `${recipientId}.click.${expStr}.${dest}`;
  if (!safeEqual(sig, signPayload(body))) return null;
  let destination: string | undefined;
  try {
    destination = fromB64url(dest).toString('utf8');
  } catch {
    return null;
  }
  return { recipientId, destination };
}

/** Allow only absolute URLs on the configured site origin, or relative paths. */
export function sanitizeTrackingDestination(raw: string): string | null {
  const site = newsletterConfig.siteUrl;
  const trimmed = (raw || '').trim();
  if (!trimmed) return site;
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.includes('\\')) return null;
    return `${site}${trimmed}`;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const siteUrl = new URL(site);
  if (url.hostname !== siteUrl.hostname && url.hostname !== `www.${siteUrl.hostname}`) {
    return null;
  }
  return url.toString();
}

function webhookKey(secret: string): Buffer {
  if (secret.startsWith('whsec_')) {
    return Buffer.from(secret.slice(6), 'base64');
  }
  return Buffer.from(secret, 'utf8');
}

/**
 * Resend uses Svix-signed webhooks.
 * signed_content = `${svix_id}.${svix_timestamp}.${rawBody}`
 * signatures in `svix-signature` are `v1,<base64>`
 */
export function verifyResendWebhookSignature(input: {
  rawBody: string | Buffer;
  svixId?: string;
  svixTimestamp?: string;
  svixSignature?: string;
  secret: string;
  toleranceSeconds?: number;
}): boolean {
  const { rawBody, svixId, svixTimestamp, svixSignature, secret } = input;
  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;
  const ts = Number(svixTimestamp);
  if (!Number.isFinite(ts)) return false;
  const skew = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (skew > (input.toleranceSeconds ?? 300)) return false;

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const expected = createHmac('sha256', webhookKey(secret)).update(signedContent).digest('base64');

  const candidates = svixSignature.split(' ').flatMap((part) => {
    const [version, value] = part.split(',');
    return version === 'v1' && value ? [value] : [];
  });
  return candidates.some((c) => safeEqual(c, expected));
}

export function newClaimToken(): string {
  return randomBytes(16).toString('hex');
}

export function backoffMs(attempt: number): number {
  const base = Math.min(60 * 60 * 1000, 1000 * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}
