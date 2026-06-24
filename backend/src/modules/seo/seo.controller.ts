import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import prisma from '../../lib/prisma';

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
      let score = 0;
      const maxScore = 100;

      // Title (name) check - 15 pts
      if (p.name && p.name.length >= 10 && p.name.length <= 70) {
        score += 15;
      } else if (p.name) {
        score += 7;
        if (p.name.length < 10) issues.push('Product name is too short (min 10 chars)');
        if (p.name.length > 70) issues.push('Product name is too long (max 70 chars)');
      } else {
        issues.push('Missing product name');
      }

      // Description check - 20 pts
      if (p.description && p.description.length >= 100) {
        score += 20;
      } else if (p.description && p.description.length >= 50) {
        score += 10;
        issues.push('Description is short (recommended 100+ chars)');
      } else {
        issues.push('Missing or very short description');
      }

      // Images check - 15 pts
      if (p.images.length >= 1) {
        score += 10;
        if (p.images.length >= 3) score += 5;
        else issues.push('Add more images (3+ recommended)');
      } else {
        issues.push('No product images');
      }

      // Image alt text - 10 pts
      const imagesWithAlt = p.images.filter((img) => img.altText && img.altText.length > 0);
      if (p.images.length > 0 && imagesWithAlt.length === p.images.length) {
        score += 10;
      } else if (imagesWithAlt.length > 0) {
        score += 5;
        issues.push(`${p.images.length - imagesWithAlt.length} image(s) missing alt text`);
      } else if (p.images.length > 0) {
        issues.push('All images missing alt text');
      }

      // SKU check - 5 pts
      if (p.sku) {
        score += 5;
      } else {
        issues.push('Missing SKU');
      }

      // Category check - 10 pts
      if (p.category) {
        score += 10;
      } else {
        issues.push('No category assigned');
      }

      // Brand check - 10 pts
      if (p.brand) {
        score += 10;
      } else {
        issues.push('No brand assigned');
      }

      // Specifications check - 10 pts
      if (p.specifications && p.specifications.length >= 3) {
        score += 10;
      } else if (p.specifications && p.specifications.length >= 1) {
        score += 5;
        issues.push('Add more specifications (3+ recommended)');
      } else {
        issues.push('No product specifications');
      }

      // Slug check - 5 pts
      if (p.slug && p.slug.length > 3) {
        score += 5;
      } else {
        issues.push('Missing or invalid slug');
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        score: Math.min(score, maxScore),
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

export default router;
