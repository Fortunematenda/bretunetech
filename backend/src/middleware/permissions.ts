import { Request, Response, NextFunction } from 'express';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';
import { ForbiddenError } from '../lib/errors';

export const requirePermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      if (!role) {
        throw new ForbiddenError('User role not found');
      }

      const permitted = await hasPermission(role, permissionName);
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
      if (!role) {
        throw new ForbiddenError('User role not found');
      }

      const permitted = await hasAnyPermission(role, permissionNames);
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
      if (!role) {
        throw new ForbiddenError('User role not found');
      }

      const permitted = await hasAllPermissions(role, permissionNames);
      if (!permitted) {
        throw new ForbiddenError(`All these permissions required: ${permissionNames.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
