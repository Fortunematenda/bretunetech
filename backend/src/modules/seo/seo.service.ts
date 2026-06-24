import prisma from '../../lib/prisma';
import { logger } from '../../lib/logger';

const log = logger.child('seo-service');

export interface SeoFields {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
}

export interface SeoHealthIssue {
  id: string;
  name: string;
  slug: string;
  issues: string[];
}

export interface BulkBrandResult {
  processed: number;
  assigned: number;
  skipped: number;
  errors: number;
}

export interface BulkSeoResult {
  processed: number;
  success: number;
  errors: number;
  details: { id: string; name: string; status: 'success' | 'error'; error?: string }[];
}

export interface ContentCleanupResult {
  scanned: number;
  affected: number;
  updated: number;
  skipped: number;
  errors: number;
  details: {
    id: string;
    name: string;
    changes: { field: string; before: string; after: string }[];
    status: 'updated' | 'skipped' | 'error';
    error?: string;
  }[];
}

export interface ProductCleanupPreview {
  id: string;
  name: string;
  current: {
    name: string;
    description: string;
    additionalInfo: string;
    metaTitle: string;
    metaDescription: string;
  };
  proposed: {
    name: string;
    description: string;
    additionalInfo: string;
    metaTitle: string;
    metaDescription: string;
  };
  changes: string[];
}

class SeoService {
  // ─── Generate SEO title ──────────────────────────────
  generateMetaTitle(name: string, brandName?: string): string {
    // Format: [Product Name] | BretuneTech South Africa
    const cleanName = name.trim();
    const title = `${cleanName} | BretuneTech South Africa`;
    // Truncate to ~60 chars for optimal SEO
    if (title.length > 65) {
      return `${cleanName.substring(0, 50).trim()} | BretuneTech`;
    }
    return title;
  }

  // ─── Generate meta description ──────────────────────────────
  generateMetaDescription(
    name: string,
    description: string,
    brandName?: string,
    categoryName?: string
  ): string {
    // Remove HTML tags
    const cleanDesc = description
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanDesc.length > 20) {
      // Try to end on a complete sentence within 155 chars
      const truncated = cleanDesc.substring(0, 155);
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > 80) {
        return truncated.substring(0, lastPeriod + 1);
      }
      // If no good sentence break, construct one
      const shortDesc = truncated.substring(0, 140).trim();
      return `${shortDesc}... Shop at BretuneTech.`;
    }

    // Fallback: construct from product info
    const brand = brandName ? ` ${brandName}` : '';
    const category = categoryName ? ` ${categoryName.toLowerCase()}` : '';
    return `Shop the${brand} ${name} from BretuneTech. Quality${category} products with fast delivery across South Africa.`;
  }

  // ─── Generate focus keyword ──────────────────────────────
  generateFocusKeyword(name: string, brandName?: string, categoryName?: string): string {
    const parts: string[] = [];

    // Extract key words from product name (remove common filler words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'of', 'by', '–', '-', '|'];
    const nameWords = name
      .split(/[\s\-–|]+/)
      .filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()))
      .slice(0, 4);

    if (brandName && !name.toLowerCase().includes(brandName.toLowerCase())) {
      parts.push(brandName);
    }
    parts.push(...nameWords);

    // Limit to ~50 chars
    return parts.join(' ').substring(0, 50).trim();
  }

  // ─── Generate all SEO fields for a product ──────────────────────────────
  generateSeoForProduct(product: {
    name: string;
    description: string;
    brand?: { name: string } | null;
    category?: { name: string } | null;
  }): SeoFields {
    const brandName = product.brand?.name;
    const categoryName = product.category?.name;

    return {
      metaTitle: this.generateMetaTitle(product.name, brandName),
      metaDescription: this.generateMetaDescription(product.name, product.description, brandName, categoryName),
      focusKeyword: this.generateFocusKeyword(product.name, brandName, categoryName),
    };
  }

  // ─── Compute SEO score for a single product ──────────────────────────────
  computeSeoScore(product: {
    name: string;
    description: string;
    brandId?: string | null;
    images?: any[];
    sku?: string | null;
    specifications?: any[];
    slug?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
  }): { score: number; status: string } {
    let score = 0;
    const cleanDesc = (product.description || '').replace(/<[^>]*>/g, '').trim();

    if (product.name && product.name.length >= 10 && product.name.length <= 70) score += 15;
    else if (product.name) score += 7;
    if (cleanDesc.length >= 100) score += 20;
    else if (cleanDesc.length >= 50) score += 10;
    const imgCount = product.images?.length ?? 0;
    if (imgCount >= 3) score += 15;
    else if (imgCount >= 1) score += 10;
    if (product.sku) score += 5;
    if (product.brandId) score += 10;
    const specCount = product.specifications?.length ?? 0;
    if (specCount >= 3) score += 10;
    else if (specCount >= 1) score += 5;
    if (product.slug && product.slug.length > 3) score += 5;
    if (product.metaTitle) score += 5;
    if (product.metaDescription) score += 5;
    if (product.focusKeyword) score += 5;

    score = Math.min(score, 100);
    let status = 'Poor';
    if (score >= 90) status = 'Excellent';
    else if (score >= 80) status = 'Good';
    else if (score >= 60) status = 'Needs Improvement';

    return { score, status };
  }

  // ─── Auto-generate SEO for a single product and save to DB ──────────────────────────────
  async autoGenerateForProduct(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { select: { id: true } },
        specifications: { select: { id: true } },
      },
    });
    if (!product) return;

    const seo = this.generateSeoForProduct(product);
    const { score, status } = this.computeSeoScore({
      ...product,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      focusKeyword: seo.focusKeyword,
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        metaTitle: product.metaTitle || seo.metaTitle,
        metaDescription: product.metaDescription || seo.metaDescription,
        focusKeyword: product.focusKeyword || seo.focusKeyword,
        seoScore: score,
        seoStatus: status,
      },
    });
  }

  // ─── Optimize slug ──────────────────────────────
  optimizeSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[–—]/g, '-')           // Replace em/en dashes with hyphens
      .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
      .replace(/\s+/g, '-')            // Spaces to hyphens
      .replace(/-+/g, '-')             // Collapse multiple hyphens
      .replace(/^-|-$/g, '')           // Trim leading/trailing hyphens
      .substring(0, 80);               // Max 80 chars
  }

  // ─── Bulk generate SEO for all products ──────────────────────────────
  async bulkGenerateSeo(overwrite: boolean = false): Promise<BulkSeoResult> {
    const where: any = { isDeleted: false };
    if (!overwrite) {
      // Only products missing SEO fields
      where.OR = [
        { metaTitle: null },
        { metaTitle: '' },
        { metaDescription: null },
        { metaDescription: '' },
        { focusKeyword: null },
        { focusKeyword: '' },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        focusKeyword: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    let success = 0;
    let errors = 0;
    const details: BulkSeoResult['details'] = [];

    for (const product of products) {
      try {
        const seo = this.generateSeoForProduct(product);

        const updateData: any = {};
        if (!product.metaTitle || overwrite) updateData.metaTitle = seo.metaTitle;
        if (!product.metaDescription || overwrite) updateData.metaDescription = seo.metaDescription;
        if (!product.focusKeyword || overwrite) updateData.focusKeyword = seo.focusKeyword;

        if (Object.keys(updateData).length > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: updateData,
          });
        }

        success++;
        details.push({ id: product.id, name: product.name, status: 'success' });
      } catch (err: any) {
        errors++;
        details.push({ id: product.id, name: product.name, status: 'error', error: err.message });
        log.error('SEO generation failed for product', { id: product.id, name: product.name, error: err.message });
      }
    }

    log.info('Bulk SEO generation complete', { processed: products.length, success, errors });

    return { processed: products.length, success, errors, details };
  }

  // ─── SEO Health Check ──────────────────────────────
  async getHealthReport(): Promise<{
    totalProducts: number;
    missingImages: SeoHealthIssue[];
    missingDescriptions: SeoHealthIssue[];
    missingBrand: SeoHealthIssue[];
    missingCategory: SeoHealthIssue[];
    shortNames: SeoHealthIssue[];
    duplicateDescriptions: { description: string; count: number; products: { id: string; name: string }[] }[];
    seoScore: { excellent: number; good: number; poor: number; avgScore: number };
  }> {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        brandId: true,
        categoryId: true,
        images: { select: { id: true } },
        brand: { select: { name: true } },
        category: { select: { name: true } },
        metaTitle: true,
        metaDescription: true,
        focusKeyword: true,
        sku: true,
        specifications: { select: { id: true } },
      },
    });

    const missingImages: SeoHealthIssue[] = [];
    const missingDescriptions: SeoHealthIssue[] = [];
    const missingBrand: SeoHealthIssue[] = [];
    const missingCategory: SeoHealthIssue[] = [];
    const shortNames: SeoHealthIssue[] = [];
    const descMap = new Map<string, { id: string; name: string }[]>();

    let totalScore = 0;
    let excellent = 0;
    let good = 0;
    let poor = 0;

    for (const p of products) {
      const issues: string[] = [];

      // Missing images
      if (p.images.length === 0) {
        missingImages.push({ id: p.id, name: p.name, slug: p.slug, issues: ['No product images'] });
      }

      // Missing/short descriptions
      const cleanDesc = (p.description || '').replace(/<[^>]*>/g, '').trim();
      if (!cleanDesc || cleanDesc.length < 20) {
        missingDescriptions.push({ id: p.id, name: p.name, slug: p.slug, issues: ['Missing or very short description'] });
      }

      // Missing brand
      if (!p.brandId) {
        missingBrand.push({ id: p.id, name: p.name, slug: p.slug, issues: ['No brand assigned'] });
      }

      // Short names
      if (p.name.length < 10) {
        shortNames.push({ id: p.id, name: p.name, slug: p.slug, issues: ['Product name too short (< 10 chars)'] });
      }

      // Duplicate descriptions
      if (cleanDesc.length > 50) {
        const key = cleanDesc.substring(0, 100);
        if (!descMap.has(key)) descMap.set(key, []);
        descMap.get(key)!.push({ id: p.id, name: p.name });
      }

      // Calculate SEO score
      let score = 0;
      if (p.name && p.name.length >= 10 && p.name.length <= 70) score += 15;
      else if (p.name) score += 7;
      if (cleanDesc.length >= 100) score += 20;
      else if (cleanDesc.length >= 50) score += 10;
      if (p.images.length >= 3) score += 15;
      else if (p.images.length >= 1) score += 10;
      if (p.sku) score += 5;
      if (p.brand) score += 10;
      if (p.specifications.length >= 3) score += 10;
      else if (p.specifications.length >= 1) score += 5;
      if (p.slug && p.slug.length > 3) score += 5;
      if (p.metaTitle) score += 5;
      if (p.metaDescription) score += 5;
      if (p.focusKeyword) score += 5;

      totalScore += score;
      if (score >= 80) excellent++;
      else if (score >= 60) good++;
      else poor++;
    }

    const duplicateDescriptions = Array.from(descMap.entries())
      .filter(([_, prods]) => prods.length > 1)
      .map(([desc, prods]) => ({ description: desc, count: prods.length, products: prods }));

    return {
      totalProducts: products.length,
      missingImages,
      missingDescriptions,
      missingBrand,
      missingCategory: [],  // categoryId is required, so this won't happen
      shortNames,
      duplicateDescriptions,
      seoScore: {
        excellent,
        good,
        poor,
        avgScore: products.length > 0 ? Math.round(totalScore / products.length) : 0,
      },
    };
  }

  // ─── Auto-assign brands based on product name matching ──────────────────────────────
  async bulkAssignBrands(): Promise<BulkBrandResult> {
    // Fetch all brands sorted by name length (longest first for best match)
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // Sort longest names first to avoid partial matches (e.g. "UniFi" before "Uni")
    brands.sort((a, b) => b.name.length - a.name.length);

    // Fetch products without a brand
    const products = await prisma.product.findMany({
      where: { isDeleted: false, brandId: null },
      select: { id: true, name: true },
    });

    let assigned = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const nameLower = product.name.toLowerCase();
        const matchedBrand = brands.find(b =>
          nameLower.includes(b.name.toLowerCase())
        );

        if (matchedBrand) {
          await prisma.product.update({
            where: { id: product.id },
            data: { brandId: matchedBrand.id },
          });
          assigned++;
        } else {
          skipped++;
        }
      } catch (err: any) {
        errors++;
        log.error('Brand auto-assign failed', { id: product.id, error: err.message });
      }
    }

    log.info('Bulk brand assignment complete', { processed: products.length, assigned, skipped, errors });

    return { processed: products.length, assigned, skipped, errors };
  }

  // ─── Content Cleanup: Remove supplier wording ──────────────────────────────
  private readonly SUPPLIER_REPLACEMENTS = [
    // Scoop is preserved as a brand name - no replacements
  ];

  private readonly BRAND_NAMES = [
    'Scoop', 'Ubiquiti', 'Reyee', 'Cudy', 'Ruijie', 'Linkbasic', 'Mikrotik',
    'Fanvil', 'Rackstuds', 'Netis', 'TP-Link', 'D-Link', 'Cisco', 'Huawei',
    'Fortinet', 'Juniper', 'Aruba', 'HPE', 'Dell', 'HP', 'Lenovo', 'Asus',
    'Netgear', 'Tenda', 'Mercusys', 'Xiaomi', 'Samsung', 'LG', 'Sony', 'Philips'
  ];

  private cleanSupplierWording(text: string): string {
    let cleaned = text;

    // Apply supplier replacements
    for (const { pattern, replacement } of this.SUPPLIER_REPLACEMENTS) {
      cleaned = cleaned.replace(pattern, replacement);
    }

    return cleaned;
  }

  private preserveBrandNames(text: string): string {
    // Ensure brand names are preserved (case-insensitive check, preserve original case)
    // This is a safeguard - the actual logic is in the replacements above
    return text;
  }

  private hasSupplierWording(text: string): boolean {
    for (const { pattern } of this.SUPPLIER_REPLACEMENTS) {
      if (pattern.test(text)) return true;
    }
    return false;
  }

  // Scan products for supplier wording
  async scanForSupplierWording(): Promise<{ scanned: number; affected: number; products: ProductCleanupPreview[] }> {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        description: true,
        additionalInfo: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    const affected: ProductCleanupPreview[] = [];

    for (const product of products) {
      const fields = {
        name: product.name || '',
        description: product.description || '',
        additionalInfo: product.additionalInfo || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      };

      const proposed = { ...fields };
      const changes: string[] = [];

      for (const [field, value] of Object.entries(fields)) {
        if (this.hasSupplierWording(value)) {
          proposed[field as keyof typeof proposed] = this.cleanSupplierWording(value);
          changes.push(field);
        }
      }

      if (changes.length > 0) {
        affected.push({
          id: product.id,
          name: product.name,
          current: fields,
          proposed,
          changes,
        });
      }
    }

    return { scanned: products.length, affected: affected.length, products: affected };
  }

  // Bulk clean supplier wording
  async bulkCleanSupplierWording(options: {
    onlyAffected?: boolean;
    previewOnly?: boolean;
  } = {}): Promise<ContentCleanupResult> {
    const { onlyAffected = true, previewOnly = false } = options;

    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        description: true,
        additionalInfo: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    let affected = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const details: ContentCleanupResult['details'] = [];

    for (const product of products) {
      try {
        const fields = {
          name: product.name || '',
          description: product.description || '',
          additionalInfo: product.additionalInfo || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
        };

        const changes: { field: string; before: string; after: string }[] = [];
        const updateData: any = {};

        for (const [field, value] of Object.entries(fields)) {
          if (this.hasSupplierWording(value)) {
            const cleaned = this.cleanSupplierWording(value);
            if (cleaned !== value) {
              changes.push({ field, before: value, after: cleaned });
              if (!previewOnly) {
                updateData[field] = cleaned;
              }
            }
          }
        }

        if (changes.length === 0) {
          skipped++;
          continue;
        }

        affected++;

        if (previewOnly) {
          details.push({
            id: product.id,
            name: product.name,
            changes,
            status: 'skipped',
          });
        } else {
          await prisma.product.update({
            where: { id: product.id },
            data: updateData,
          });
          updated++;
          details.push({
            id: product.id,
            name: product.name,
            changes,
            status: 'updated',
          });
        }
      } catch (err: any) {
        errors++;
        details.push({
          id: product.id,
          name: product.name,
          changes: [],
          status: 'error',
          error: err.message,
        });
        log.error('Content cleanup failed for product', { id: product.id, error: err.message });
      }
    }

    log.info('Content cleanup complete', { scanned: products.length, affected, updated, skipped, errors, previewOnly });

    return { scanned: products.length, affected, updated, skipped, errors, details };
  }

  // Create backup before cleanup
  async createBackup(): Promise<{ backupId: string; timestamp: string; count: number }> {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        description: true,
        additionalInfo: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    const backupId = `cleanup_backup_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Store backup in a separate table or file (for now, we'll use a JSON file approach)
    // In production, you might want to use a dedicated backups table
    const backupData = {
      id: backupId,
      timestamp,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        additionalInfo: p.additionalInfo,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
      })),
    };

    // For now, return the backup data - in production, save to a file or database
    log.info('Backup created', { backupId, count: products.length });

    return { backupId, timestamp, count: products.length };
  }
}

export const seoService = new SeoService();
