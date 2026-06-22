import prisma from './prisma';
import { Role } from '../../generated/prisma/client';

export async function hasPermission(role: string, permissionName: string, customRoleId?: string): Promise<boolean> {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  // Check standard role permissions
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role: role as Role,
      permission: {
        name: permissionName,
      },
    },
  });

  if (rolePermission) {
    return true;
  }

  // Check custom role permissions if user has a custom role
  if (customRoleId) {
    const customRolePermission = await prisma.customRolePermission.findFirst({
      where: {
        customRoleId,
        permission: {
          name: permissionName,
        },
      },
    });

    return !!customRolePermission;
  }

  return false;
}

export async function hasAnyPermission(role: string, permissionNames: string[], customRoleId?: string): Promise<boolean> {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  // Check standard role permissions
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: role as Role,
      permission: {
        name: { in: permissionNames },
      },
    },
  });

  if (rolePermissions.length > 0) {
    return true;
  }

  // Check custom role permissions if user has a custom role
  if (customRoleId) {
    const customRolePermissions = await prisma.customRolePermission.findMany({
      where: {
        customRoleId,
        permission: {
          name: { in: permissionNames },
        },
      },
    });

    return customRolePermissions.length > 0;
  }

  return false;
}

export async function hasAllPermissions(role: string, permissionNames: string[], customRoleId?: string): Promise<boolean> {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  // Check standard role permissions
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: role as Role,
      permission: {
        name: { in: permissionNames },
      },
    },
  });

  if (rolePermissions.length === permissionNames.length) {
    return true;
  }

  // Check custom role permissions if user has a custom role
  if (customRoleId) {
    const customRolePermissions = await prisma.customRolePermission.findMany({
      where: {
        customRoleId,
        permission: {
          name: { in: permissionNames },
        },
      },
    });

    return customRolePermissions.length === permissionNames.length;
  }

  return false;
}

export async function getUserPermissions(role: string, customRoleId?: string): Promise<string[]> {
  if (role === 'SUPER_ADMIN') {
    const allPermissions = await prisma.permission.findMany();
    return allPermissions.map(p => p.name);
  }

  // Get standard role permissions
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: role as Role },
    include: { permission: true },
  });

  const permissions = new Set(rolePermissions.map(rp => rp.permission.name));

  // Add custom role permissions if user has a custom role
  if (customRoleId) {
    const customRolePermissions = await prisma.customRolePermission.findMany({
      where: { customRoleId },
    });

    // Get permission IDs and fetch permissions separately
    const permissionIds = customRolePermissions.map(crp => crp.permissionId);
    const permissionsData = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    permissionsData.forEach(p => permissions.add(p.name));
  }

  return Array.from(permissions);
}
