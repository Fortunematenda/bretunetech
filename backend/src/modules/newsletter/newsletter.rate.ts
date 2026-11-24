/**
 * Database-backed send rate limiter shared across worker processes.
 * In-memory helpers remain for unit tests only.
 */

import prisma from '../../lib/prisma';

const BUCKET_ID = 'send';

let windowStartedAt = 0;
let sentInWindow = 0;

export function resetNewsletterRateLimiterForTests() {
  windowStartedAt = 0;
  sentInWindow = 0;
}

/** In-memory rate check used by unit tests. */
export function canSendWithinRate(ratePerMinute: number, now = Date.now()): boolean {
  if (now - windowStartedAt >= 60_000) {
    windowStartedAt = now;
    sentInWindow = 0;
  }
  return sentInWindow < ratePerMinute;
}

export function recordSendInRateWindow(now = Date.now()) {
  if (now - windowStartedAt >= 60_000) {
    windowStartedAt = now;
    sentInWindow = 0;
  }
  sentInWindow += 1;
}

export function msUntilRateWindowReset(now = Date.now()): number {
  if (!windowStartedAt) return 0;
  return Math.max(0, 60_000 - (now - windowStartedAt));
}

/**
 * Atomically reserve one send slot in the shared DB bucket.
 * Returns false when the per-minute limit is exhausted.
 */
export async function tryAcquireSendSlot(ratePerMinute: number, now = new Date()): Promise<boolean> {
  const limit = Math.max(1, ratePerMinute);
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string; windowStartedAt: Date; sentCount: number }>>`
      SELECT id, "windowStartedAt", "sentCount"
      FROM newsletter_rate_buckets
      WHERE id = ${BUCKET_ID}
      FOR UPDATE
    `;

    if (!rows.length) {
      await tx.newsletterRateBucket.create({
        data: { id: BUCKET_ID, windowStartedAt: now, sentCount: 1 },
      });
      return true;
    }

    const bucket = rows[0];
    const windowAge = now.getTime() - new Date(bucket.windowStartedAt).getTime();
    if (windowAge >= 60_000) {
      await tx.newsletterRateBucket.update({
        where: { id: BUCKET_ID },
        data: { windowStartedAt: now, sentCount: 1 },
      });
      return true;
    }
    if (bucket.sentCount >= limit) {
      return false;
    }
    await tx.newsletterRateBucket.update({
      where: { id: BUCKET_ID },
      data: { sentCount: { increment: 1 } },
    });
    return true;
  });
}

export async function msUntilSharedRateWindowReset(now = new Date()): Promise<number> {
  const bucket = await prisma.newsletterRateBucket.findUnique({ where: { id: BUCKET_ID } });
  if (!bucket) return 0;
  return Math.max(0, 60_000 - (now.getTime() - bucket.windowStartedAt.getTime()));
}
