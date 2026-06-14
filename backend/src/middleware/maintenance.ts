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

  // Skip maintenance check for orders (allow users to view orders and download invoices)
  if (req.path.startsWith('/api/orders')) {
    return next();
  }

  // Skip maintenance check for products, categories, brands (needed for admin)
  if (req.path.startsWith('/api/products') || 
      req.path.startsWith('/api/categories') || 
      req.path.startsWith('/api/brands') ||
      req.path.startsWith('/api/bookings')) {
    return next();
  }

  // Allow admin users to bypass maintenance mode
  if (req.user?.role === 'ADMIN') {
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
