import prisma from './prisma';
import { Role } from '../../generated/prisma/client';

export async function hasPermission(role: string, permissionName: string): Promise<boolean> {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role: role as Role,
      permission: {
        name: permissionName,
      },
    },
  });

  return !!rolePermission;
}

export async function hasAnyPermission(role: string, permissionNames: string[]): Promise<boolean> {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: role as Role,
      permission: {
        name: { in: permissionNames },
      },
    },
  });

  return rolePermissions.length > 0;
}

export async function hasAllPermissions(role: string, permissionNames: string[]): Promise<boolean> {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: role as Role,
      permission: {
        name: { in: permissionNames },
      },
    },
  });

  return rolePermissions.length === permissionNames.length;
}

export async function getUserPermissions(role: string): Promise<string[]> {
  if (role === 'SUPER_ADMIN') {
    const allPermissions = await prisma.permission.findMany();
    return allPermissions.map(p => p.name);
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: role as Role },
    include: { permission: true },
  });

  return rolePermissions.map(rp => rp.permission.name);
}
