import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

const unsubSecret = () => process.env.NEWSLETTER_TOKEN_SECRET || process.env.JWT_SECRET || 'newsletter-dev-secret';

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function newSubscriberToken(): string {
  return randomBytes(32).toString('base64url');
}

export function signUnsubscribeToken(subscriberId: string): string {
  return createHmac('sha256', unsubSecret()).update(subscriberId).digest('base64url');
}

export function verifyUnsubscribeToken(subscriberId: string, token: string): boolean {
  const expected = signUnsubscribeToken(subscriberId);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}