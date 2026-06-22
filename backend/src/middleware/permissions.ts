import { Request, Response, NextFunction } from 'express';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';
import { ForbiddenError } from '../lib/errors';

export const requirePermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      const customRoleId = req.user?.customRoleId;
      if (!role) {
        throw new ForbiddenError('User role not found');
      }

      const permitted = await hasPermission(role, permissionName, customRoleId);
      if (!permitted) {
        throw new ForbiddenError(`Permission required: ${permissionName}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyPermission = (permissionNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      const customRoleId = req.user?.customRoleId;
      if (!role) {
        throw new ForbiddenError('User role not found');
      }

      const permitted = await hasAnyPermission(role, permissionNames, customRoleId);
      if (!permitted) {
        throw new ForbiddenError(`One of these permissions required: ${permissionNames.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAllPermissions = (permissionNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      const customRoleId = req.user?.customRoleId;
      if (!role) {
        throw new ForbiddenError('User role not found');
      }

      const permitted = await hasAllPermissions(role, permissionNames, customRoleId);
      if (!permitted) {
        throw new ForbiddenError(`All these permissions required: ${permissionNames.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
