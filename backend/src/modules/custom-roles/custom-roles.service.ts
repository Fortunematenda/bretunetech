import prisma from '../../lib/prisma';
import { CreateCustomRoleDto, UpdateCustomRoleDto, AssignPermissionToCustomRoleDto, RemovePermissionFromCustomRoleDto } from './custom-roles.dto';
import { ConflictError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { randomUUID } from 'crypto';

const log = logger.child('CustomRolesService');

export class CustomRolesService {
  async createCustomRole(dto: CreateCustomRoleDto) {
    const existing = await prisma.customRole.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictError('Custom role with this name already exists');
    }

    const customRole = await prisma.customRole.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        description: dto.description,
      },
    });

    log.info('Custom role created', { name: dto.name });
    return customRole;
  }

  async getCustomRoles() {
    return prisma.customRole.findMany({
      include: {
        _count: {
          select: { users: true, permissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomRoleById(id: string) {
    const customRole = await prisma.customRole.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!customRole) throw new NotFoundError('CustomRole');
    return customRole;
  }

  async updateCustomRole(id: string, dto: UpdateCustomRoleDto) {
    const customRole = await prisma.customRole.update({
      where: { id },
      data: dto,
    });

    log.info('Custom role updated', { id });
    return customRole;
  }

  async deleteCustomRole(id: string) {
    // Check if any users are assigned to this role
    const usersWithRole = await prisma.user.count({
      where: { customRoleId: id },
    });

    if (usersWithRole > 0) {
      throw new ConflictError('Cannot delete custom role with assigned users');
    }

    await prisma.customRole.delete({
      where: { id },
    });

    log.info('Custom role deleted', { id });
    return { success: true };
  }

  async assignPermissionToCustomRole(dto: AssignPermissionToCustomRoleDto) {
    const existing = await prisma.customRolePermission.findFirst({
      where: {
        customRoleId: dto.customRoleId,
        permissionId: dto.permissionId,
      },
    });

    if (existing) {
      throw new ConflictError('Permission already assigned to this custom role');
    }

    const customRolePermission = await prisma.customRolePermission.create({
      data: {
        id: randomUUID(),
        customRoleId: dto.customRoleId,
        permissionId: dto.permissionId,
      },
    });

    log.info('Permission assigned to custom role', { customRoleId: dto.customRoleId, permissionId: dto.permissionId });
    return customRolePermission;
  }

  async removePermissionFromCustomRole(dto: RemovePermissionFromCustomRoleDto) {
    await prisma.customRolePermission.deleteMany({
      where: {
        customRoleId: dto.customRoleId,
        permissionId: dto.permissionId,
      },
    });

    log.info('Permission removed from custom role', { customRoleId: dto.customRoleId, permissionId: dto.permissionId });
    return { success: true };
  }

  async getCustomRolePermissions(customRoleId: string) {
    const customRolePermissions = await prisma.customRolePermission.findMany({
      where: { customRoleId },
    });

    // Get permission IDs and fetch permissions separately
    const permissionIds = customRolePermissions.map(crp => crp.permissionId);
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      orderBy: { category: 'asc' },
    });

    return permissions;
  }

  async assignCustomRoleToUser(userId: string, customRoleId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { customRoleId },
    });

    log.info('Custom role assigned to user', { userId, customRoleId });
    return user;
  }

  async removeCustomRoleFromUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { customRoleId: null },
    });

    log.info('Custom role removed from user', { userId });
    return user;
  }
}

export const customRolesService = new CustomRolesService();
