import { z } from 'zod';

export const createCustomRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateCustomRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const assignPermissionToCustomRoleSchema = z.object({
  customRoleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export const removePermissionFromCustomRoleSchema = z.object({
  customRoleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export type CreateCustomRoleDto = z.infer<typeof createCustomRoleSchema>;
export type UpdateCustomRoleDto = z.infer<typeof updateCustomRoleSchema>;
export type AssignPermissionToCustomRoleDto = z.infer<typeof assignPermissionToCustomRoleSchema>;
export type RemovePermissionFromCustomRoleDto = z.infer<typeof removePermissionFromCustomRoleSchema>;
