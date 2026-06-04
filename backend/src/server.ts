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
import { logger } from './lib/logger';

import authRoutes from './modules/auth/auth.controller';
import productRoutes from './modules/products/product.controller';
import categoryRoutes from './modules/categories/category.controller';
import bundleRoutes from './modules/bundles/bundle.controller';
import cartRoutes from './modules/cart/cart.controller';
import orderRoutes from './modules/orders/order.controller';
import adminRoutes from './modules/admin/admin.controller';
import contactRoutes from './modules/contact/contact.controller';
import addressRoutes from './modules/addresses/address.controller';
import importRoutes from './modules/import/import.controller';
import wishlistRoutes from './modules/wishlist/routes';

const app = express();
const PORT = process.env.PORT || 4000;

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

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/import', importRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);

// Public shipping settings endpoint
app.get('/api/shipping-settings', async (_req, res) => {
  const { adminService } = await import('./modules/admin/admin.service');
  const settings = await adminService.getShippingSettings();
  res.json(settings);
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
app.listen(PORT, () => {
  logger.info(`Bretunetech API running on http://localhost:${PORT}`);
});

export default app;
