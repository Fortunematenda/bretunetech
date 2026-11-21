import prisma from '../../lib/prisma';
import type { Prisma } from '../../../generated/prisma/client';

export async function auditNewsletter(
  action: string,
  entity: string,
  entityId: string | null,
  actorId: string | null,
  detail?: Record<string, unknown>,
) {
  await prisma.newsletterAuditLog.create({
    data: { action, entity, entityId, actorId, detail: (detail ?? undefined) as Prisma.InputJsonValue | undefined },
  });
}