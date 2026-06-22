import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  category: z.string().min(1).max(100),
});

export const updatePermissionSchema = z.object({
  description: z.string().max(500).optional(),
  category: z.string().min(1).max(100).optional(),
});

export const assignPermissionSchema = z.object({
  role: z.enum(['ADMIN', 'STAFF', 'VENDOR']),
  permissionId: z.string().uuid(),
});

export const removePermissionSchema = z.object({
  role: z.enum(['ADMIN', 'STAFF', 'VENDOR']),
  permissionId: z.string().uuid(),
});

export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>;
export type AssignPermissionDto = z.infer<typeof assignPermissionSchema>;
export type RemovePermissionDto = z.infer<typeof removePermissionSchema>;
