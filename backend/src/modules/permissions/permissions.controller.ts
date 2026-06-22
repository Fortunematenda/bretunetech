import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { permissionsService } from './permissions.service';
import {
  createPermissionSchema,
  updatePermissionSchema,
  assignPermissionSchema,
  removePermissionSchema,
} from './permissions.dto';

const router = Router();

// GET /api/permissions - Get all permissions (SUPER_ADMIN only)
router.get(
  '/',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  asyncHandler(async (req: Request, res: Response) => {
    const permissions = await permissionsService.getPermissions();
    res.json(permissions);
  })
);

// GET /api/permissions/by-category - Get permissions grouped by category (SUPER_ADMIN only)
router.get(
  '/by-category',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  asyncHandler(async (req: Request, res: Response) => {
    const permissions = await permissionsService.getPermissionsByCategory();
    res.json(permissions);
  })
);

// GET /api/permissions/:id - Get permission by ID (SUPER_ADMIN only)
router.get(
  '/:id',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  asyncHandler(async (req: Request, res: Response) => {
    const permission = await permissionsService.getPermissionById(req.params.id as string);
    res.json(permission);
  })
);

// POST /api/permissions - Create permission (SUPER_ADMIN only)
router.post(
  '/',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  validate(createPermissionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const permission = await permissionsService.createPermission(req.body);
    res.status(201).json(permission);
  })
);

// PUT /api/permissions/:id - Update permission (SUPER_ADMIN only)
router.put(
  '/:id',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  validate(updatePermissionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const permission = await permissionsService.updatePermission(req.params.id as string, req.body);
    res.json(permission);
  })
);

// DELETE /api/permissions/:id - Delete permission (SUPER_ADMIN only)
router.delete(
  '/:id',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await permissionsService.deletePermission(req.params.id as string);
    res.json(result);
  })
);

// POST /api/permissions/assign - Assign permission to role (SUPER_ADMIN only)
router.post(
  '/assign',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  validate(assignPermissionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const rolePermission = await permissionsService.assignPermissionToRole(req.body);
    res.status(201).json(rolePermission);
  })
);

// POST /api/permissions/remove - Remove permission from role (SUPER_ADMIN only)
router.post(
  '/remove',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  validate(removePermissionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await permissionsService.removePermissionFromRole(req.body);
    res.json(result);
  })
);

// GET /api/permissions/role/:role - Get permissions for a specific role (SUPER_ADMIN only)
router.get(
  '/role/:role',
  authenticate,
  requirePermission('admin_users.manage_roles'),
  asyncHandler(async (req: Request, res: Response) => {
    const permissions = await permissionsService.getRolePermissions(req.params.role as string);
    res.json(permissions);
  })
);

export default router;
