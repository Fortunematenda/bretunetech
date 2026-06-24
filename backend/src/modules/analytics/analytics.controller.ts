import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error-handler';
import { analyticsService } from './analytics.service';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

// POST /api/analytics/track - Public endpoint for tracking (no auth required)
const trackSchema = z.object({
  visitorId: z.string().min(1).max(64),
  sessionId: z.string().min(1).max(64),
  pageUrl: z.string().min(1).max(2048),
  pageTitle: z.string().max(500).optional(),
  referrer: z.string().max(2048).optional(),
  productId: z.string().max(64).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  browser: z.string().max(50).optional(),
  deviceType: z.string().max(20).optional(),
  ipAddress: z.string().max(50).optional(),
});

const BOT_UA_PATTERN = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|rogerbot|seznambot|petalbot|bytespider|crawler|spider|bot\b/i;

router.post(
  '/track',
  validate(trackSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const userAgent = req.headers['user-agent'] || req.body.userAgent || '';

    // Silently drop bot/crawler requests
    if (BOT_UA_PATTERN.test(userAgent)) {
      return res.status(204).send() as any;
    }
    
    // Use frontend-provided geolocation data if available, otherwise fallback to headers
    let country = req.body.country || req.headers['cf-ipcountry']?.toString() || req.headers['x-country']?.toString() || undefined;
    let city = req.body.city || req.headers['cf-ipcity']?.toString() || req.headers['x-city']?.toString() || undefined;

    // Fallback to IP-based geolocation if still no country/city
    if (!country && !city && ip) {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data: any = await response.json();
        if (data.status === 'success') {
          country = data.country || undefined;
          city = data.city || undefined;
        }
      } catch (error) {
        // Silently fail - geolocation is optional
      }
      
      // Development fallback for localhost
      if (!country && !city && (ip === '::1' || ip === '127.0.0.1')) {
        country = 'South Africa';
        city = 'Cape Town';
      }
    }

    await analyticsService.track({
      visitorId: req.body.visitorId,
      sessionId: req.body.sessionId,
      ip: req.body.ipAddress || ip,
      userAgent: req.body.userAgent || userAgent,
      pageUrl: req.body.pageUrl,
      pageTitle: req.body.pageTitle,
      referrer: req.body.referrer,
      productId: req.body.productId || undefined,
      country,
      city,
      browser: req.body.browser,
      deviceType: req.body.deviceType,
    } as any);

    res.status(204).send();
  })
);

// GET /api/analytics/summary - Admin only
router.get(
  '/summary',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const summary = await analyticsService.getSummary();
    res.json(summary);
  })
);

// GET /api/analytics/top-pages - Admin only
router.get(
  '/top-pages',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const pages = await analyticsService.getTopPages(days);
    res.json(pages);
  })
);

// GET /api/analytics/top-products - Admin only
router.get(
  '/top-products',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const products = await analyticsService.getTopProducts(days);
    res.json(products);
  })
);

// GET /api/analytics/traffic-sources - Admin only
router.get(
  '/traffic-sources',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const sources = await analyticsService.getTrafficSources(days);
    res.json(sources);
  })
);

// GET /api/analytics/device-breakdown - Admin only
router.get(
  '/device-breakdown',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const devices = await analyticsService.getDeviceBreakdown(days);
    res.json(devices);
  })
);

// GET /api/analytics/visitors-over-time - Admin only
router.get(
  '/visitors-over-time',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const data = await analyticsService.getVisitorsOverTime(days);
    res.json(data);
  })
);

// GET /api/analytics/browsers - Admin only
router.get(
  '/browsers',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const browsers = await analyticsService.getBrowserBreakdown(days);
    res.json(browsers);
  })
);

// GET /api/analytics/product/:id - Admin only
router.get(
  '/product/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getProductAnalytics(req.params.id as string);
    res.json(data);
  })
);

// GET /api/analytics/customers/summary - Admin only
router.get(
  '/customers/summary',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const summary = await analyticsService.getCustomerSummary();
    res.json(summary);
  })
);

// GET /api/analytics/customers/recent - Admin only
router.get(
  '/customers/recent',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const customers = await analyticsService.getRecentCustomers(limit);
    res.json(customers);
  })
);

// GET /api/analytics/visitors-list - Admin only
router.get(
  '/visitors-list',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 1;
    const data = await analyticsService.getVisitorsList(days);
    res.json(data);
  })
);

// GET /api/analytics/hourly - Admin only
router.get(
  '/hourly',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getHourlyVisitors();
    res.json(data);
  })
);

// GET /api/analytics/detailed-page-views - Admin only
router.get(
  '/detailed-page-views',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const data = await analyticsService.getDetailedPageViews(days);
    res.json(data);
  })
);

// GET /api/analytics/detailed-product-views - Admin only
router.get(
  '/detailed-product-views',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const data = await analyticsService.getDetailedProductViews(days);
    res.json(data);
  })
);

// GET /api/analytics/unique-visitors-detail - Admin only
router.get(
  '/unique-visitors-detail',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const data = await analyticsService.getUniqueVisitorsDetail(days);
    res.json(data);
  })
);

// GET /api/analytics/new-vs-returning - Admin only
router.get(
  '/new-vs-returning',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const data = await analyticsService.getNewVsReturning(days);
    res.json(data);
  })
);

// GET /api/analytics/weekly-breakdown - Admin only
router.get(
  '/weekly-breakdown',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getWeeklyBreakdown();
    res.json(data);
  })
);

// GET /api/analytics/live - Admin only
router.get(
  '/live',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getLiveVisitors();
    res.json(data);
  })
);

// GET /api/analytics/customers/new-detailed - Admin only
router.get(
  '/customers/new-detailed',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 1;
    const data = await analyticsService.getNewCustomersDetailed(days);
    res.json(data);
  })
);

// GET /api/analytics/customers/registrations - Admin only
router.get(
  '/customers/registrations',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const data = await analyticsService.getCustomerRegistrations(days);
    res.json(data);
  })
);

export default router;
