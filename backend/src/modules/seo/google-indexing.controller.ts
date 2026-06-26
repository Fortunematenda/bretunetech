import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error-handler';
import { googleIndexingService } from './google-indexing.service';

const router = Router();

// GET /api/seo/google-indexing/dashboard
router.get(
  '/dashboard',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const dashboard = await googleIndexingService.getDashboard();
    res.json(dashboard);
  })
);

// GET /api/seo/google-indexing/important-pages
router.get(
  '/important-pages',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const pages = await googleIndexingService.getImportantPages();
    res.json({ pages, gscBaseUrl: googleIndexingService.getGscUrl() });
  })
);

// POST /api/seo/google-indexing/inspect
router.post(
  '/inspect',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { url, pageType, notes } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }
    const result = await googleIndexingService.inspectUrl(url, pageType || 'page', notes);
    res.json(result);
  })
);

// POST /api/seo/google-indexing/inspect-batch
router.post(
  '/inspect-batch',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { urls, notes } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls array is required' });
    }
    const results = await googleIndexingService.inspectUrls(urls, notes);
    res.json({ results, apiEnabled: googleIndexingService.isApiEnabled() });
  })
);

// GET /api/seo/google-indexing/priority-products
router.get(
  '/priority-products',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const products = await googleIndexingService.getPriorityProductInspections(limit);
    res.json({ products, gscBaseUrl: googleIndexingService.getGscUrl() });
  })
);

// GET /api/seo/google-indexing/follow-ups
router.get(
  '/follow-ups',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const followUps = await googleIndexingService.getFollowUps();
    res.json({ followUps, gscBaseUrl: googleIndexingService.getGscUrl() });
  })
);

// PUT /api/seo/google-indexing/notes
router.put(
  '/notes',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { url, notes } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }
    const record = await googleIndexingService.updateNotes(url, notes || '');
    res.json(record);
  })
);

// POST /api/seo/google-indexing/dismiss-follow-up
router.post(
  '/dismiss-follow-up',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }
    const record = await googleIndexingService.dismissFollowUp(url);
    res.json(record);
  })
);

// GET /api/seo/google-indexing/health-report
router.get(
  '/health-report',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const report = await googleIndexingService.getHealthReport();
    res.json({ report });
  })
);

// GET /api/seo/google-indexing/checklist
router.get(
  '/checklist',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const checklist = await googleIndexingService.getChecklist();
    res.json(checklist);
  })
);

// PUT /api/seo/google-indexing/checklist
router.put(
  '/checklist',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const checklist = await googleIndexingService.updateChecklist(req.body);
    res.json(checklist);
  })
);

// POST /api/seo/google-indexing/generate-alt-text
router.post(
  '/generate-alt-text',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await googleIndexingService.generateImageAltText();
    res.json(result);
  })
);

// POST /api/seo/google-indexing/build-related-links
router.post(
  '/build-related-links',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await googleIndexingService.buildRelatedProductLinks();
    res.json(result);
  })
);

// POST /api/seo/google-indexing/generate-schemas
router.post(
  '/generate-schemas',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await googleIndexingService.generateAllProductSchemas();
    res.json(result);
  })
);

// POST /api/seo/google-indexing/refresh-sitemap
router.post(
  '/refresh-sitemap',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      sitemapUrl: googleIndexingService.getSitemapUrl(),
      message: 'Sitemap is generated automatically by the frontend. Verify it is submitted in Google Search Console.',
    });
  })
);

export default router;
