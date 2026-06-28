import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import prisma from '../../lib/prisma';
import { seoService, googleIndexingService } from './seo.service';
import { specsService } from '../specs/specs.service';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: any) => Promise<any>) =>
  (req: Request, res: Response, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/seo/products/score - Get SEO scores for all products
router.get(
  '/products/score',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sku: true,
        images: { select: { url: true, altText: true } },
        category: { select: { name: true } },
        brand: { select: { name: true } },
        specifications: { select: { key: true, value: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const scored = products.map((p) => {
      const issues: string[] = [];
      const maxScore = 100;

      // Diagnostics only — the numeric score comes from the single shared scorer
      if (!p.name) issues.push('Missing product name');
      else if (p.name.length < 10) issues.push('Product name is too short (min 10 chars)');
      else if (p.name.length > 70) issues.push('Product name is too long (max 70 chars)');

      if (!p.description || p.description.length < 50) issues.push('Missing or very short description');
      else if (p.description.length < 100) issues.push('Description is short (recommended 100+ chars)');

      if (p.images.length === 0) issues.push('No product images');
      else if (p.images.length < 3) issues.push('Add more images (3+ recommended)');

      const imagesWithAlt = p.images.filter((img) => img.altText && img.altText.length > 0);
      if (p.images.length > 0 && imagesWithAlt.length === 0) issues.push('All images missing alt text');
      else if (p.images.length > 0 && imagesWithAlt.length < p.images.length) {
        issues.push(`${p.images.length - imagesWithAlt.length} image(s) missing alt text`);
      }

      if (!p.sku) issues.push('Missing SKU');
      if (!p.category) issues.push('No category assigned');
      if (!p.brand) issues.push('No brand assigned');

      if (!p.specifications || p.specifications.length === 0) issues.push('No product specifications');
      else if (p.specifications.length < 3) issues.push('Add more specifications (3+ recommended)');

      if (!p.slug || p.slug.length <= 3) issues.push('Missing or invalid slug');

      const { score } = seoService.computeSeoScore({
        name: p.name,
        description: p.description || '',
        brandId: p.brand ? 'set' : null,
        images: p.images,
        sku: p.sku,
        specifications: p.specifications,
        slug: p.slug,
      });

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        score,
        maxScore,
        issues,
        imageCount: p.images.length,
        hasCategory: !!p.category,
        hasBrand: !!p.brand,
      };
    });

    // Sort by score ascending (worst first)
    scored.sort((a, b) => a.score - b.score);

    const avgScore = scored.length > 0 ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length) : 0;
    const excellent = scored.filter((s) => s.score >= 80).length;
    const good = scored.filter((s) => s.score >= 60 && s.score < 80).length;
    const poor = scored.filter((s) => s.score < 60).length;

    res.json({
      summary: { avgScore, total: scored.length, excellent, good, poor },
      products: scored,
    });
  })
);

// POST /api/seo/assign-brands - Auto-assign brands to products by name matching
router.post(
  '/assign-brands',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await seoService.bulkAssignBrands();
    res.json(result);
  })
);

// POST /api/seo/generate-all - Bulk generate SEO for all products
router.post(
  '/generate-all',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const overwrite = req.body.overwrite === true;
    const result = await seoService.bulkGenerateSeo(overwrite);
    res.json(result);
  })
);

// GET /api/seo/health - SEO health report
router.get(
  '/health',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const report = await seoService.getHealthReport();
    res.json(report);
  })
);

// GET /api/seo/product/:id - Get auto-generated SEO for a single product
router.get(
  '/product/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { select: { url: true, altText: true }, orderBy: { sortOrder: 'asc' } },
        brand: { select: { name: true } },
        category: { select: { name: true } },
        specifications: { select: { key: true, value: true } },
      },
    }) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Use stored SEO fields or auto-generate
    const seo = seoService.generateSeoForProduct(product);

    res.json({
      metaTitle: product.metaTitle || seo.metaTitle,
      metaDescription: product.metaDescription || seo.metaDescription,
      focusKeyword: product.focusKeyword || seo.focusKeyword,
      openGraph: {
        title: product.metaTitle || seo.metaTitle,
        description: product.metaDescription || seo.metaDescription,
        image: product.images[0]?.url || null,
        url: `https://www.bretunetech.com/products/${product.slug}`,
      },
      twitterCard: {
        card: 'summary_large_image',
        title: product.metaTitle || seo.metaTitle,
        description: product.metaDescription || seo.metaDescription,
        image: product.images[0]?.url || null,
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: (product.metaDescription || seo.metaDescription),
        image: product.images.map((img: any) => img.url),
        sku: product.sku || undefined,
        brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
        category: product.category?.name,
        offers: {
          '@type': 'Offer',
          price: product.sellingPrice,
          priceCurrency: 'ZAR',
          availability: product.stockQuantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `https://www.bretunetech.com/products/${product.slug}`,
        },
      },
    });
  })
);

// GET /api/seo/verification - Public: get verification meta tags
router.get(
  '/verification',
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['googleSiteVerification', 'bingSiteVerification'] },
      },
      select: { key: true, value: true },
    });
    const result: Record<string, string> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json(result);
  })
);

// POST /api/seo/extract-specs - Bulk extract specs from additional info
router.post(
  '/extract-specs',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      onlyWithoutSpecs = true,
      replace = false,
      removeFromAdditionalInfo = false,
    } = req.body;
    const result = await specsService.bulkExtract({
      onlyWithoutSpecs: Boolean(onlyWithoutSpecs),
      replace: Boolean(replace),
      removeFromAdditionalInfo: Boolean(removeFromAdditionalInfo),
    });
    res.json(result);
  })
);

// POST /api/seo/extract-specs/:id - Extract specs for a single product
router.post(
  '/extract-specs/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    const { replace = false, removeFromAdditionalInfo = false } = req.body;
    const result = await specsService.extractForProduct(productId, {
      replace: Boolean(replace),
      removeFromAdditionalInfo: Boolean(removeFromAdditionalInfo),
    });
    res.json(result);
  })
);

// GET /api/seo/cleanup/scan - Scan products for supplier wording
router.get(
  '/cleanup/scan',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await seoService.scanForSupplierWording();
    res.json(result);
  })
);

// POST /api/seo/cleanup/execute - Execute content cleanup
router.post(
  '/cleanup/execute',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { previewOnly = false, onlyAffected = true } = req.body;
    const result = await seoService.bulkCleanSupplierWording({
      previewOnly: Boolean(previewOnly),
      onlyAffected: Boolean(onlyAffected),
    });
    res.json(result);
  })
);

// POST /api/seo/cleanup/backup - Create backup before cleanup
router.post(
  '/cleanup/backup',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await seoService.createBackup();
    res.json(result);
  })
);

// GET /api/seo/dashboard-stats
router.get(
  '/dashboard-stats',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await seoService.getDashboardStats();
    res.json(stats);
  })
);

// GET /api/seo/product/:id/editor
router.get(
  '/product/:id/editor',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const data = await seoService.getProductEditor(String(req.params.id));
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  })
);

// PUT /api/seo/product/:id
router.put(
  '/product/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { metaTitle, metaDescription, focusKeyword } = req.body;
    const result = await seoService.updateProductSeo(String(req.params.id), { metaTitle, metaDescription, focusKeyword });
    res.json(result);
  })
);

// GET /api/seo/categories
router.get(
  '/categories',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await seoService.getCategoriesSeo();
    res.json(categories);
  })
);

// PUT /api/seo/category/:id
router.put(
  '/category/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { metaTitle, metaDescription, focusKeyword } = req.body;
    const result = await seoService.updateCategorySeo(String(req.params.id), { metaTitle, metaDescription, focusKeyword });
    res.json(result);
  })
);

// GET /api/seo/pages
router.get(
  '/pages',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const pages = await seoService.getPagesSeo();
    res.json(pages);
  })
);

// PUT /api/seo/pages/:slug
router.put(
  '/pages/:slug',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { metaTitle, metaDescription, focusKeyword } = req.body;
    const result = await seoService.updatePageSeo(String(req.params.slug), { metaTitle, metaDescription, focusKeyword });
    res.json(result);
  })
);

// GET /api/seo/audit
router.get(
  '/audit',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await seoService.runFullAudit();
    res.json(result);
  })
);

// GET /api/seo/settings
router.get(
  '/settings',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await seoService.getSeoSettings();
    res.json(settings);
  })
);

// PUT /api/seo/settings
router.put(
  '/settings',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await seoService.updateSeoSettings(req.body);
    res.json(result);
  })
);

// POST /api/seo/generate-schemas
router.post(
  '/generate-schemas',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const overwrite = req.body.overwrite === true;
    const result = await seoService.bulkGenerateSchemas(overwrite);
    res.json(result);
  })
);

// POST /api/seo/optimize-slugs
router.post(
  '/optimize-slugs',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const dryRun = req.body.dryRun !== false;
    const result = await seoService.bulkOptimizeSlugs(dryRun);
    res.json(result);
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// Google Search Console / Indexing routes (merged into the single SEO controller)
// Mounted under /api/seo, so these resolve to /api/seo/google-indexing/*
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/seo/google-indexing/dashboard
router.get(
  '/google-indexing/dashboard',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const dashboard = await googleIndexingService.getDashboard();
    res.json(dashboard);
  })
);

// GET /api/seo/google-indexing/important-pages
router.get(
  '/google-indexing/important-pages',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const pages = await googleIndexingService.getImportantPages();
    res.json({ pages, gscBaseUrl: googleIndexingService.getGscUrl() });
  })
);

// POST /api/seo/google-indexing/inspect
router.post(
  '/google-indexing/inspect',
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
  '/google-indexing/inspect-batch',
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
  '/google-indexing/priority-products',
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
  '/google-indexing/follow-ups',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const followUps = await googleIndexingService.getFollowUps();
    res.json({ followUps, gscBaseUrl: googleIndexingService.getGscUrl() });
  })
);

// PUT /api/seo/google-indexing/notes
router.put(
  '/google-indexing/notes',
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
  '/google-indexing/dismiss-follow-up',
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
  '/google-indexing/health-report',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const report = await googleIndexingService.getHealthReport();
    res.json({ report });
  })
);

// GET /api/seo/google-indexing/checklist
router.get(
  '/google-indexing/checklist',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const checklist = await googleIndexingService.getChecklist();
    res.json(checklist);
  })
);

// PUT /api/seo/google-indexing/checklist
router.put(
  '/google-indexing/checklist',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const checklist = await googleIndexingService.updateChecklist(req.body);
    res.json(checklist);
  })
);

// POST /api/seo/google-indexing/generate-alt-text
router.post(
  '/google-indexing/generate-alt-text',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await googleIndexingService.generateImageAltText();
    res.json(result);
  })
);

// POST /api/seo/google-indexing/build-related-links
router.post(
  '/google-indexing/build-related-links',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await googleIndexingService.buildRelatedProductLinks();
    res.json(result);
  })
);

// POST /api/seo/google-indexing/generate-schemas - uses the single shared schema generator
router.post(
  '/google-indexing/generate-schemas',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await seoService.bulkGenerateSchemas(true);
    res.json(result);
  })
);

// POST /api/seo/google-indexing/refresh-sitemap
router.post(
  '/google-indexing/refresh-sitemap',
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
