import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import { errorHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limit';
import { checkMaintenanceMode } from './middleware/maintenance';
import { logger } from './lib/logger';

import authRoutes from './modules/auth/auth.controller';
import productRoutes from './modules/products/product.controller';
import categoryRoutes from './modules/categories/category.controller';
import brandRoutes from './modules/brands/brand.controller';
import bundleRoutes from './modules/bundles/bundle.controller';
import cartRoutes from './modules/cart/cart.controller';
import orderRoutes from './modules/orders/order.controller';
import adminRoutes from './modules/admin/admin.controller';
import contactRoutes from './modules/contact/contact.controller';
import addressRoutes from './modules/addresses/address.controller';
import importRoutes from './modules/import/import.controller';
import wishlistRoutes from './modules/wishlist/routes';
import reviewRoutes from './modules/reviews/routes';
import adRoutes from './modules/ads/routes';
import { bookingRouter } from './modules/bookings/booking.controller';
import heroRoutes from './modules/hero/routes';
import notificationRoutes from './modules/notifications/notification.controller';
import { settingRouter } from './modules/settings/setting.controller';
import supplierRoutes from './modules/suppliers/supplier.controller';
import marketingAdRoutes from './modules/marketing-ads/routes';
import returnRoutes from './modules/returns/return.controller';
import analyticsRoutes from './modules/analytics/analytics.controller';
import addressValidateRoutes from './modules/addresses/address-validate.controller';
import permissionRoutes from './modules/permissions/permissions.controller';
import customRolesRoutes from './modules/custom-roles/custom-roles.controller';
import seoRoutes from './modules/seo/seo.controller';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for rate limiter (required when behind Nginx)
app.set('trust proxy', 1);

// ─── Global Middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);
app.use(checkMaintenanceMode);

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/import', importRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/bookings', bookingRouter);
app.use('/api/hero', heroRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingRouter);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/marketing-ads', marketingAdRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/address', addressValidateRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/custom-roles', customRolesRoutes);
app.use('/api/seo', seoRoutes);

// Public maintenance status endpoint
app.get('/api/maintenance-status', async (_req, res) => {
  try {
    const { adminService } = await import('./modules/admin/admin.service');
    const settings = await adminService.getBusinessSettings();
    res.json({
      maintenanceMode: settings?.maintenanceMode || false,
      message: settings?.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
    });
  } catch {
    res.json({ maintenanceMode: false, message: '' });
  }
});

// Public shipping settings endpoint
app.get('/api/shipping-settings', async (_req, res) => {
  const { adminService } = await import('./modules/admin/admin.service');
  const settings = await adminService.getShippingSettings();
  res.json(settings);
});

// Public announcements endpoint
app.get('/api/announcements', async (_req, res) => {
  try {
    const { adminService } = await import('./modules/admin/admin.service');
    const settings = await adminService.getShippingSettings();
    const threshold = settings.freeShippingThreshold || 2000;
    
    res.json([
      { icon: 'truck', text: `🚚 Free Delivery Over R${threshold}` },
      { icon: 'clock', text: '⚡ Same Day Cape Town Dispatch' },
      { icon: 'headphones', text: '📞 24/7 Enterprise Support' },
    ]);
  } catch (err) {
    res.json([
      { icon: 'truck', text: '🚚 Free Delivery Over R2000' },
      { icon: 'clock', text: '⚡ Same Day Cape Town Dispatch' },
      { icon: 'headphones', text: '📞 24/7 Enterprise Support' },
    ]);
  }
});

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Bretunetech API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 Handler ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Global Error Handler (must be last) ───────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`Bretunetech API running on http://localhost:${PORT}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

// Catch unhandled errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Prevent process from exiting
setInterval(() => {
  // Keepalive heartbeat
}, 10000);
