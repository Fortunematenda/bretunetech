import { Router, Request, Response } from 'express';
import { authenticate, superAdminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { customRolesService } from './custom-roles.service';
import {
  createCustomRoleSchema,
  updateCustomRoleSchema,
  assignPermissionToCustomRoleSchema,
  removePermissionFromCustomRoleSchema,
} from './custom-roles.dto';

const router = Router();

// GET /api/custom-roles - Get all custom roles (SUPER_ADMIN only)
router.get(
  '/',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const customRoles = await customRolesService.getCustomRoles();
    res.json(customRoles);
  })
);

// GET /api/custom-roles/:id - Get custom role by ID (SUPER_ADMIN only)
router.get(
  '/:id',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const customRole = await customRolesService.getCustomRoleById(req.params.id as string);
    res.json(customRole);
  })
);

// POST /api/custom-roles - Create custom role (SUPER_ADMIN only)
router.post(
  '/',
  authenticate,
  superAdminOnly,
  validate(createCustomRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const customRole = await customRolesService.createCustomRole(req.body);
    res.status(201).json(customRole);
  })
);

// PUT /api/custom-roles/:id - Update custom role (SUPER_ADMIN only)
router.put(
  '/:id',
  authenticate,
  superAdminOnly,
  validate(updateCustomRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const customRole = await customRolesService.updateCustomRole(req.params.id as string, req.body);
    res.json(customRole);
  })
);

// DELETE /api/custom-roles/:id - Delete custom role (SUPER_ADMIN only)
router.delete(
  '/:id',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await customRolesService.deleteCustomRole(req.params.id as string);
    res.json(result);
  })
);

// GET /api/custom-roles/:id/permissions - Get permissions for a custom role (SUPER_ADMIN only)
router.get(
  '/:id/permissions',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const permissions = await customRolesService.getCustomRolePermissions(req.params.id as string);
    res.json(permissions);
  })
);

// POST /api/custom-roles/assign-permission - Assign permission to custom role (SUPER_ADMIN only)
router.post(
  '/assign-permission',
  authenticate,
  superAdminOnly,
  validate(assignPermissionToCustomRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const customRolePermission = await customRolesService.assignPermissionToCustomRole(req.body);
    res.status(201).json(customRolePermission);
  })
);

// POST /api/custom-roles/remove-permission - Remove permission from custom role (SUPER_ADMIN only)
router.post(
  '/remove-permission',
  authenticate,
  superAdminOnly,
  validate(removePermissionFromCustomRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await customRolesService.removePermissionFromCustomRole(req.body);
    res.json(result);
  })
);

// POST /api/custom-roles/assign-to-user/:userId - Assign custom role to user (SUPER_ADMIN only)
router.post(
  '/assign-to-user/:userId',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await customRolesService.assignCustomRoleToUser(req.params.userId as string, req.body.customRoleId);
    res.json(user);
  })
);

// POST /api/custom-roles/remove-from-user/:userId - Remove custom role from user (SUPER_ADMIN only)
router.post(
  '/remove-from-user/:userId',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await customRolesService.removeCustomRoleFromUser(req.params.userId as string);
    res.json(user);
  })
);

export default router;
