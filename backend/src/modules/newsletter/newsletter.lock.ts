import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';

const LOCK_ID = 'queue';
const DEFAULT_TTL_MS = 55_000;

export function newWorkerOwnerId() {
  return `${process.pid}:${randomUUID()}`;
}

/** Acquire exclusive worker tick lock. Expired locks can be stolen. */
export async function tryAcquireWorkerLock(ownerId: string, ttlMs = DEFAULT_TTL_MS): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);

  await prisma.$executeRaw`
    INSERT INTO newsletter_worker_locks (id, "ownerId", "expiresAt", "updatedAt")
    VALUES (${LOCK_ID}, ${ownerId}, ${expiresAt}, ${now})
    ON CONFLICT (id) DO UPDATE SET
      "ownerId" = EXCLUDED."ownerId",
      "expiresAt" = EXCLUDED."expiresAt",
      "updatedAt" = EXCLUDED."updatedAt"
    WHERE newsletter_worker_locks."expiresAt" < ${now}
       OR newsletter_worker_locks."ownerId" = ${ownerId}
  `;

  const lock = await prisma.newsletterWorkerLock.findUnique({ where: { id: LOCK_ID } });
  return lock?.ownerId === ownerId;
}

export async function releaseWorkerLock(ownerId: string): Promise<void> {
  await prisma.newsletterWorkerLock.deleteMany({
    where: { id: LOCK_ID, ownerId },
  });
}
