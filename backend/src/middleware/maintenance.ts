import { Request, Response, NextFunction } from 'express';
import { adminService } from '../modules/admin/admin.service';

export async function checkMaintenanceMode(req: Request, res: Response, next: NextFunction) {
  // Skip maintenance check for admin routes and maintenance status endpoint
  if (req.path.startsWith('/api/admin') || req.path === '/api/maintenance-status') {
    return next();
  }

  // Skip maintenance check for authentication endpoints
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  try {
    const settings = await adminService.getBusinessSettings();
    
    if (settings?.maintenanceMode) {
      return res.status(503).json({
        maintenanceMode: true,
        message: settings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
      });
    }

    next();
  } catch (error) {
    // If we can't check maintenance mode, allow the request to proceed
    next();
  }
}
