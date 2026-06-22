import prisma from '../../lib/prisma';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionDto, RemovePermissionDto } from './permissions.dto';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors';
import { logger } from '../../lib/logger';

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
    const existing = await prisma.rolePermission.findUnique({
      where: {
        role_permissionId: {
          role: dto.role,
          permissionId: dto.permissionId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Permission already assigned to this role');
    }

    const rolePermission = await prisma.rolePermission.create({
      data: dto,
    });

    log.info('Permission assigned to role', { role: dto.role, permissionId: dto.permissionId });
    return rolePermission;
  }

  async removePermissionFromRole(dto: RemovePermissionDto) {
    await prisma.rolePermission.delete({
      where: {
        role_permissionId: {
          role: dto.role,
          permissionId: dto.permissionId,
        },
      },
    });

    log.info('Permission removed from role', { role: dto.role, permissionId: dto.permissionId });
    return { success: true };
  }

  async getRolePermissions(role: string) {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          category: 'asc',
        },
      },
    });

    return rolePermissions.map(rp => rp.permission);
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
