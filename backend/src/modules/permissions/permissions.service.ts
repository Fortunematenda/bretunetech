import prisma from '../../lib/prisma';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionDto, RemovePermissionDto } from './permissions.dto';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { Role } from '../../../generated/prisma/client';

const log = logger.child('PermissionsService');

export class PermissionsService {
  async createPermission(dto: CreatePermissionDto) {
    const existing = await prisma.permission.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictError('Permission with this name already exists');
    }

    const permission = await prisma.permission.create({
      data: dto,
    });

    log.info('Permission created', { name: dto.name });
    return permission;
  }

  async getPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async getPermissionById(id: string) {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          select: {
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!permission) throw new NotFoundError('Permission');
    return permission;
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const permission = await prisma.permission.update({
      where: { id },
      data: dto,
    });

    log.info('Permission updated', { id });
    return permission;
  }

  async deletePermission(id: string) {
    await prisma.permission.delete({
      where: { id },
    });

    log.info('Permission deleted', { id });
    return { success: true };
  }

  async assignPermissionToRole(dto: AssignPermissionDto) {
    // Use raw SQL to avoid enum type casting issues
    const existing = await prisma.$queryRaw<any[]>`
      SELECT * FROM "role_permissions"
      WHERE "role" = ${dto.role} AND "permissionId" = ${dto.permissionId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      throw new ConflictError('Permission already assigned to this role');
    }

    const rolePermission = await prisma.$queryRaw<any>`
      INSERT INTO "role_permissions" (id, "role", "permissionId", "createdAt")
      VALUES (gen_random_uuid(), ${dto.role}, ${dto.permissionId}, NOW())
      RETURNING *
    `;

    log.info('Permission assigned to role', { role: dto.role, permissionId: dto.permissionId });
    return rolePermission[0];
  }

  async removePermissionFromRole(dto: RemovePermissionDto) {
    // Use raw SQL to avoid enum type casting issues
    await prisma.$executeRaw`
      DELETE FROM "role_permissions"
      WHERE "role" = ${dto.role} AND "permissionId" = ${dto.permissionId}
    `;

    log.info('Permission removed from role', { role: dto.role, permissionId: dto.permissionId });
    return { success: true };
  }

  async getRolePermissions(role: string) {
    // Use raw SQL to avoid enum type casting issues
    const rolePermissions = await prisma.$queryRaw<any[]>`
      SELECT rp.*, p.*
      FROM "role_permissions" rp
      JOIN "permissions" p ON p.id = rp."permissionId"
      WHERE rp."role" = ${role}
      ORDER BY p.category ASC
    `;

    return rolePermissions.map(rp => ({
      id: rp.id,
      name: rp.name,
      description: rp.description,
      category: rp.category,
      createdAt: rp.createdAt,
      updatedAt: rp.updatedAt,
    }));
  }

  async getPermissionsByCategory() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return grouped;
  }
}

export const permissionsService = new PermissionsService();
