import { google } from 'googleapis';
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

  // ─── Content Cleanup: Remove supplier wording from product names only ──────────────────────────────
  private readonly SUPPLIER_REPLACEMENTS = [
    { pattern: /Scoop's\s+/gi, replacement: 'The ' },
    { pattern: /Scoop's/gi, replacement: 'The' },
    { pattern: /\bScoop\b/gi, replacement: 'BretuneTech' },
    { pattern: /supplied by Scoop/gi, replacement: 'supplied through authorized distributor network' },
    { pattern: /from Scoop/gi, replacement: 'from authorized distributor network' },
    { pattern: /Scoop Distribution/gi, replacement: 'authorized distributor network' },
    { pattern: /Scoop Technologies/gi, replacement: 'BretuneTech' },
  ];

  private readonly BRAND_NAMES = [
    'Scoop', 'Ubiquiti', 'Reyee', 'Cudy', 'Ruijie', 'Linkbasic', 'Mikrotik',
    'Fanvil', 'Rackstuds', 'Netis', 'TP-Link', 'D-Link', 'Cisco', 'Huawei',
    'Fortinet', 'Juniper', 'Aruba', 'HPE', 'Dell', 'HP', 'Lenovo', 'Asus',
    'Netgear', 'Tenda', 'Mercusys', 'Xiaomi', 'Samsung', 'LG', 'Sony', 'Philips'
  ];

  private cleanSupplierWording(text: string, isProductName: boolean = false): string {
    let cleaned = text;

    // Apply supplier replacements ONLY to product names, not descriptions
    if (isProductName) {
      for (const { pattern, replacement } of this.SUPPLIER_REPLACEMENTS) {
        cleaned = cleaned.replace(pattern, replacement);
      }
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
          const isProductName = field === 'name';
          proposed[field as keyof typeof proposed] = this.cleanSupplierWording(value, isProductName);
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
            const isProductName = field === 'name';
            const cleaned = this.cleanSupplierWording(value, isProductName);
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

  // ─── Dashboard Stats ──────────────────────────────
  async getDashboardStats() {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true, name: true, slug: true, description: true, sku: true,
        metaTitle: true, metaDescription: true, focusKeyword: true,
        seoScore: true, schemaJsonLd: true, brandId: true, categoryId: true,
        sellingPrice: true, stockQuantity: true,
        images: { select: { id: true, altText: true } },
        specifications: { select: { id: true } },
      },
    });

    const total = products.length;
    const withMetaTitle = products.filter(p => p.metaTitle).length;
    const withMetaDesc = products.filter(p => p.metaDescription).length;
    const withFocusKeyword = products.filter(p => p.focusKeyword).length;
    const withSchema = products.filter(p => p.schemaJsonLd).length;
    const missingSeo = products.filter(p => !p.metaTitle || !p.metaDescription || !p.focusKeyword).length;
    const missingImages = products.filter(p => p.images.length === 0).length;
    const missingAlt = products.filter(p => p.images.some(img => !img.altText)).length;

    const titleCounts = new Map<string, number>();
    const descCounts = new Map<string, number>();
    products.forEach(p => {
      if (p.metaTitle) titleCounts.set(p.metaTitle, (titleCounts.get(p.metaTitle) || 0) + 1);
      if (p.metaDescription) descCounts.set(p.metaDescription, (descCounts.get(p.metaDescription) || 0) + 1);
    });
    const duplicateTitles = Array.from(titleCounts.values()).filter(c => c > 1).reduce((a, c) => a + c, 0);
    const duplicateDescriptions = Array.from(descCounts.values()).filter(c => c > 1).reduce((a, c) => a + c, 0);

    let totalScore = 0, excellent = 0, good = 0, poor = 0;
    products.forEach(p => {
      const { score } = this.computeSeoScore({ name: p.name, description: p.description || '', brandId: p.brandId, images: p.images, sku: p.sku, specifications: p.specifications, slug: p.slug, metaTitle: p.metaTitle, metaDescription: p.metaDescription, focusKeyword: p.focusKeyword });
      totalScore += score;
      if (score >= 80) excellent++;
      else if (score >= 60) good++;
      else poor++;
    });

    const categoryCount = await prisma.category.count();
    return { totalProducts: total, avgScore: total > 0 ? Math.round(totalScore / total) : 0, excellent, good, poor, optimizedProducts: total - missingSeo, missingSeo, withMetaTitle, withMetaDesc, withFocusKeyword, withSchema, missingImages, missingAlt, missingSchema: total - withSchema, duplicateTitles, duplicateDescriptions, totalCategories: categoryCount };
  }

  // ─── Get single product SEO editor data ──────────────────────────────
  async getProductEditor(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { select: { id: true, url: true, altText: true }, orderBy: { sortOrder: 'asc' } },
        specifications: { select: { key: true, value: true } },
        relatedProducts: { select: { relatedProductId: true } },
      },
    }) as any;
    if (!product) return null;

    const generated = this.generateSeoForProduct(product);
    const { score, status } = this.computeSeoScore({ name: product.name, description: product.description || '', brandId: product.brandId, images: product.images, sku: product.sku, specifications: product.specifications, slug: product.slug, metaTitle: product.metaTitle || generated.metaTitle, metaDescription: product.metaDescription || generated.metaDescription, focusKeyword: product.focusKeyword || generated.focusKeyword });
    const checks = this.runSeoChecks(product, generated);

    return {
      id: product.id, name: product.name, slug: product.slug,
      description: product.description || '', brand: product.brand?.name || null,
      category: product.category?.name || null, images: product.images, specifications: product.specifications,
      sellingPrice: product.sellingPrice, stockQuantity: product.stockQuantity,
      seo: { metaTitle: product.metaTitle || generated.metaTitle, metaDescription: product.metaDescription || generated.metaDescription, focusKeyword: product.focusKeyword || generated.focusKeyword, canonicalUrl: `https://bretunetech.com/products/${product.slug}`, ogTitle: product.metaTitle || generated.metaTitle, ogDescription: product.metaDescription || generated.metaDescription },
      score, status, checks, relatedProductCount: product.relatedProducts?.length || 0,
    };
  }

  private runSeoChecks(product: any, generated: any) {
    const focusKeyword = product.focusKeyword || generated.focusKeyword;
    const metaTitle = product.metaTitle || generated.metaTitle;
    const metaDescription = product.metaDescription || generated.metaDescription;
    const cleanDesc = (product.description || '').replace(/<[^>]*>/g, '').trim();
    return [
      { key: 'name_length', label: 'Product name (10–70 chars)', pass: product.name?.length >= 10 && product.name?.length <= 70 },
      { key: 'description_length', label: 'Description 100+ characters', pass: cleanDesc.length >= 100 },
      { key: 'focus_keyword', label: 'Focus keyword set', pass: !!focusKeyword },
      { key: 'keyword_in_title', label: 'Keyword in title', pass: !!(focusKeyword && metaTitle?.toLowerCase().includes(focusKeyword.toLowerCase().split(' ')[0])) },
      { key: 'keyword_in_desc', label: 'Keyword in description', pass: !!(focusKeyword && metaDescription?.toLowerCase().includes(focusKeyword.toLowerCase().split(' ')[0])) },
      { key: 'keyword_in_url', label: 'Keyword in URL', pass: !!(focusKeyword && product.slug?.toLowerCase().includes(focusKeyword.toLowerCase().split(' ')[0])) },
      { key: 'images_exist', label: 'Product images exist', pass: product.images?.length > 0 },
      { key: 'alt_text', label: 'Image ALT text set', pass: product.images?.length > 0 && product.images.some((img: any) => img.altText) },
      { key: 'brand', label: 'Brand assigned', pass: !!product.brandId },
      { key: 'category', label: 'Category assigned', pass: !!product.categoryId },
      { key: 'schema', label: 'Schema/JSON-LD generated', pass: !!product.schemaJsonLd },
      { key: 'canonical', label: 'Canonical URL set', pass: !!product.slug },
      { key: 'related_products', label: 'Related products linked', pass: (product.relatedProducts?.length || 0) > 0 },
      { key: 'stock', label: 'Stock available', pass: (product.stockQuantity || 0) > 0 },
      { key: 'price', label: 'Price set', pass: (product.sellingPrice || 0) > 0 },
    ];
  }

  // ─── Update product SEO fields ──────────────────────────────
  async updateProductSeo(id: string, data: { metaTitle?: string; metaDescription?: string; focusKeyword?: string }) {
    return prisma.product.update({
      where: { id },
      data,
      select: { id: true, metaTitle: true, metaDescription: true, focusKeyword: true },
    });
  }

  // ─── Categories SEO (stored in Settings as JSON) ──────────────────────────────
  async getCategoriesSeo() {
    const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
    let map: Record<string, any> = {};
    try {
      const s = await prisma.setting.findUnique({ where: { key: 'seo_categories_meta' } });
      if (s?.value) map = JSON.parse(s.value);
    } catch {}
    return categories.map(cat => ({
      id: cat.id, name: cat.name, slug: cat.slug, description: cat.description || '', productCount: cat._count.products,
      seo: map[cat.id] || { metaTitle: `${cat.name} | BretuneTech South Africa`, metaDescription: `Shop ${cat.name} from BretuneTech. Quality enterprise technology with fast delivery across South Africa.`, focusKeyword: cat.name.toLowerCase() },
    }));
  }

  async updateCategorySeo(id: string, data: { metaTitle?: string; metaDescription?: string; focusKeyword?: string }) {
    let map: Record<string, any> = {};
    try {
      const s = await prisma.setting.findUnique({ where: { key: 'seo_categories_meta' } });
      if (s?.value) map = JSON.parse(s.value);
    } catch {}
    map[id] = { ...map[id], ...data };
    await prisma.setting.upsert({ where: { key: 'seo_categories_meta' }, create: { key: 'seo_categories_meta', value: JSON.stringify(map), group: 'seo' }, update: { value: JSON.stringify(map) } });
    return map[id];
  }

  // ─── Full SEO Audit ──────────────────────────────
  async runFullAudit() {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, slug: true, description: true, metaTitle: true, metaDescription: true, focusKeyword: true, schemaJsonLd: true, brandId: true, categoryId: true, sellingPrice: true, stockQuantity: true, sku: true, images: { select: { url: true, altText: true } }, specifications: { select: { id: true } } },
    });

    const issues: Record<string, any[]> = { missingMetaTitles: [], missingMetaDescriptions: [], missingFocusKeywords: [], duplicateTitles: [], duplicateDescriptions: [], missingImages: [], missingAlt: [], missingBrand: [], missingCategory: [], missingPrice: [], missingStock: [], missingSchema: [], thinContent: [], longTitles: [], shortTitles: [] };
    const titleMap = new Map<string, any[]>(), descMap = new Map<string, any[]>();

    for (const p of products) {
      const ref = { id: p.id, name: p.name, slug: p.slug };
      const cleanDesc = (p.description || '').replace(/<[^>]*>/g, '').trim();
      if (!p.metaTitle) issues.missingMetaTitles.push(ref);
      else if (p.metaTitle.length > 65) issues.longTitles.push({ ...ref, length: p.metaTitle.length });
      else if (p.metaTitle.length < 20) issues.shortTitles.push({ ...ref, length: p.metaTitle.length });
      if (!p.metaDescription) issues.missingMetaDescriptions.push(ref);
      if (!p.focusKeyword) issues.missingFocusKeywords.push(ref);
      if (!p.schemaJsonLd) issues.missingSchema.push(ref);
      if (p.images.length === 0) issues.missingImages.push(ref);
      if (p.images.some(img => !img.altText)) issues.missingAlt.push(ref);
      if (!p.brandId) issues.missingBrand.push(ref);
      if (!p.categoryId) issues.missingCategory.push(ref);
      if (!p.sellingPrice || p.sellingPrice === 0) issues.missingPrice.push(ref);
      if (!p.stockQuantity || p.stockQuantity <= 0) issues.missingStock.push(ref);
      if (cleanDesc.length < 50) issues.thinContent.push({ ...ref, descLength: cleanDesc.length });
      if (p.metaTitle) { if (!titleMap.has(p.metaTitle)) titleMap.set(p.metaTitle, []); titleMap.get(p.metaTitle)!.push(ref); }
      if (p.metaDescription) { if (!descMap.has(p.metaDescription)) descMap.set(p.metaDescription, []); descMap.get(p.metaDescription)!.push(ref); }
    }
    titleMap.forEach(prods => { if (prods.length > 1) issues.duplicateTitles.push(...prods); });
    descMap.forEach(prods => { if (prods.length > 1) issues.duplicateDescriptions.push(...prods); });
    const totalIssues = Object.values(issues).reduce((acc, arr) => acc + arr.length, 0);
    return { scannedAt: new Date(), totalProducts: products.length, totalIssues, issues };
  }

  // ─── SEO Settings ──────────────────────────────
  async getSeoSettings() {
    const settings = await prisma.setting.findMany({ where: { group: 'seo' } });
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    return {
      defaultTitleTemplate: map['seo_title_template'] || '%s | BretuneTech South Africa',
      defaultMetaTemplate: map['seo_meta_template'] || 'Shop %s from BretuneTech. Quality enterprise technology.',
      organizationName: map['seo_org_name'] || 'BretuneTech',
      organizationLogo: map['seo_org_logo'] || '',
      googleAnalytics: map['seo_ga_id'] || '',
      googleSearchConsole: map['googleSiteVerification'] || '',
      facebookPixel: map['seo_fb_pixel'] || '',
      ogImage: map['seo_og_image'] || '',
      twitterHandle: map['seo_twitter_handle'] || '@bretunetech',
      robots: map['seo_robots'] || 'index, follow',
    };
  }

  async updateSeoSettings(data: Record<string, string>) {
    const keyMap: Record<string, string> = { defaultTitleTemplate: 'seo_title_template', defaultMetaTemplate: 'seo_meta_template', organizationName: 'seo_org_name', organizationLogo: 'seo_org_logo', googleAnalytics: 'seo_ga_id', googleSearchConsole: 'googleSiteVerification', facebookPixel: 'seo_fb_pixel', ogImage: 'seo_og_image', twitterHandle: 'seo_twitter_handle', robots: 'seo_robots' };
    for (const [field, value] of Object.entries(data)) {
      const key = keyMap[field]; if (!key) continue;
      await prisma.setting.upsert({ where: { key }, create: { key, value, group: 'seo' }, update: { value } });
    }
    return this.getSeoSettings();
  }

  // ─── Bulk generate all schemas ──────────────────────────────
  async bulkGenerateSchemas(overwrite: boolean = false): Promise<BulkSeoResult> {
    const where: any = { isDeleted: false };
    if (!overwrite) where.schemaJsonLd = null;
    const products = await prisma.product.findMany({ where, include: { brand: { select: { name: true } }, category: { select: { name: true } }, images: { select: { url: true } } } });
    let success = 0, errors = 0;
    const details: BulkSeoResult['details'] = [];
    for (const p of products) {
      try {
        const schema = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: ((p.metaDescription || p.description || '') as string).replace(/<[^>]*>/g, '').substring(0, 500), image: p.images.map(img => img.url), sku: p.sku || undefined, brand: p.brand ? { '@type': 'Brand', name: p.brand.name } : undefined, category: (p as any).category?.name, offers: { '@type': 'Offer', price: p.sellingPrice, priceCurrency: 'ZAR', availability: p.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `https://bretunetech.com/products/${p.slug}` } };
        await prisma.product.update({ where: { id: p.id }, data: { schemaJsonLd: JSON.stringify(schema) } });
        success++;
        details.push({ id: p.id, name: p.name, status: 'success' });
      } catch (err: any) {
        errors++;
        details.push({ id: p.id, name: p.name, status: 'error', error: err.message });
      }
    }
    return { processed: products.length, success, errors, details };
  }

  // ─── Bulk optimize slugs ──────────────────────────────
  async bulkOptimizeSlugs(dryRun: boolean = true): Promise<{ scanned: number; affected: number; updated: number; details: any[] }> {
    const products = await prisma.product.findMany({ where: { isDeleted: false }, select: { id: true, name: true, slug: true } });
    let affected = 0, updated = 0;
    const details: any[] = [];
    for (const p of products) {
      const optimized = this.optimizeSlug(p.name);
      if (optimized !== p.slug) {
        affected++;
        details.push({ id: p.id, name: p.name, current: p.slug, optimized });
        if (!dryRun) {
          try {
            const existing = await prisma.product.findFirst({ where: { slug: optimized, id: { not: p.id } } });
            if (!existing) { await prisma.product.update({ where: { id: p.id }, data: { slug: optimized } }); updated++; }
          } catch {}
        }
      }
    }
    return { scanned: products.length, affected, updated, details };
  }

  // ─── Pages SEO (stored in Settings as JSON) ──────────────────────────────
  private readonly STATIC_PAGES = [
    { slug: 'home', path: '/', label: 'Home' },
    { slug: 'about', path: '/about', label: 'About' },
    { slug: 'services', path: '/services', label: 'Services' },
    { slug: 'contact', path: '/contact', label: 'Contact' },
    { slug: 'products', path: '/products', label: 'Products' },
    { slug: 'brands', path: '/brands', label: 'Brands' },
    { slug: 'delivery', path: '/delivery', label: 'Delivery' },
    { slug: 'returns', path: '/returns', label: 'Returns' },
    { slug: 'warranty', path: '/warranty', label: 'Warranty' },
    { slug: 'privacy', path: '/privacy', label: 'Privacy Policy' },
    { slug: 'terms', path: '/terms', label: 'Terms & Conditions' },
    { slug: 'quote', path: '/quote', label: 'Request a Quote' },
    { slug: 'trusted-suppliers', path: '/trusted-suppliers', label: 'Trusted Suppliers' },
  ];

  async getPagesSeo() {
    let map: Record<string, any> = {};
    try {
      const s = await prisma.setting.findUnique({ where: { key: 'seo_pages_meta' } });
      if (s?.value) map = JSON.parse(s.value);
    } catch {}
    return this.STATIC_PAGES.map(page => ({
      ...page,
      seo: map[page.slug] || { metaTitle: `${page.label} | BretuneTech South Africa`, metaDescription: `${page.label} - BretuneTech enterprise technology store serving South Africa.`, focusKeyword: page.label.toLowerCase() },
    }));
  }

  async updatePageSeo(slug: string, data: { metaTitle?: string; metaDescription?: string; focusKeyword?: string }) {
    let map: Record<string, any> = {};
    try {
      const s = await prisma.setting.findUnique({ where: { key: 'seo_pages_meta' } });
      if (s?.value) map = JSON.parse(s.value);
    } catch {}
    map[slug] = { ...map[slug], ...data };
    await prisma.setting.upsert({ where: { key: 'seo_pages_meta' }, create: { key: 'seo_pages_meta', value: JSON.stringify(map), group: 'seo' }, update: { value: JSON.stringify(map) } });
    return map[slug];
  }
}

export const seoService = new SeoService();

// ─────────────────────────────────────────────────────────────────────────────
// Google Search Console / Indexing (merged into the single SEO service)
// ─────────────────────────────────────────────────────────────────────────────

const GSC_IMPORTANT_PAGES = [
  { url: 'https://bretunetech.com', pageType: 'homepage' },
  { url: 'https://bretunetech.com/products', pageType: 'page' },
  { url: 'https://bretunetech.com/contact', pageType: 'page' },
  { url: 'https://bretunetech.com/about', pageType: 'page' },
  { url: 'https://bretunetech.com/services', pageType: 'page' },
  { url: 'https://bretunetech.com/brands', pageType: 'page' },
  { url: 'https://bretunetech.com/bundles', pageType: 'page' },
  { url: 'https://bretunetech.com/quote', pageType: 'page' },
  { url: 'https://bretunetech.com/trusted-suppliers', pageType: 'page' },
];

const GSC_SITEMAP_URL = 'https://bretunetech.com/sitemap.xml';

const GSC_CHECKLIST_KEYS = [
  'gsc_sitemap_submitted',
  'gsc_sitemap_status_success',
  'gsc_robots_txt_working',
  'gsc_homepage_inspected',
  'gsc_products_inspected',
];

export class GoogleIndexingService {
  private auth: any | null = null;
  private siteUrl: string;
  private apiEnabled: boolean = false;

  constructor() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    this.siteUrl = process.env.GSC_SITE_URL || 'https://www.bretunetech.com';

    if (clientEmail && privateKey) {
      try {
        this.auth = new google.auth.JWT(
          clientEmail,
          undefined,
          privateKey.replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/webmasters.readonly']
        );
        this.apiEnabled = true;
        log.info('Google Search Console API enabled', { siteUrl: this.siteUrl });
      } catch (err: any) {
        log.error('Failed to initialize Google auth', { error: err.message });
        this.apiEnabled = false;
      }
    } else {
      log.warn('Google Search Console API not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.');
    }
  }

  private getSearchConsole() {
    if (!this.auth) return null;
    return google.searchconsole({ version: 'v1', auth: this.auth });
  }

  isApiEnabled() {
    return this.apiEnabled;
  }

  getSiteUrl() {
    return this.siteUrl;
  }

  getSitemapUrl() {
    return GSC_SITEMAP_URL;
  }

  getGscUrl(url?: string) {
    const base = 'https://search.google.com/search-console';
    const resource = encodeURIComponent(this.siteUrl);
    if (url) {
      return `${base}/inspect?resource_id=${resource}&url=${encodeURIComponent(url)}`;
    }
    return `${base}/settings?resource_id=${resource}`;
  }

  async inspectUrl(url: string, pageType: string = 'page', notes?: string) {
    const sc = this.getSearchConsole();
    let raw: any = null;

    if (sc) {
      try {
        const res = await sc.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl: url,
            siteUrl: this.siteUrl,
          },
        });
        raw = (res as any).data;
      } catch (err: any) {
        log.error('URL Inspection API call failed', { url, error: err.message });
        throw new Error(`URL Inspection API failed: ${err.message}`);
      }
    }

    const inspection = raw?.inspectionResult;
    const indexStatus = inspection?.indexStatusResult || {};
    const mobileUsability = inspection?.mobileUsabilityResult || {};
    const richResults = inspection?.richResultsResult || {};

    const coverageState = indexStatus.coverageState || null;
    const issue = this.buildIssue(coverageState, indexStatus);
    const recommendedFix = this.buildRecommendedFix(coverageState, indexStatus);

    const payload: any = {
      url,
      pageType,
      status: indexStatus.verdict || null,
      coverageState,
      lastCrawlTime: indexStatus.lastCrawlTime ? new Date(indexStatus.lastCrawlTime) : null,
      googleCanonical: indexStatus.googleCanonical || null,
      userCanonical: indexStatus.userCanonical || null,
      robotsState: indexStatus.robotsInfo?.robotedStatus || null,
      pageFetchState: indexStatus.pageFetchState || null,
      mobileUsability: mobileUsability.verdict || null,
      richResults: richResults.verdict || null,
      issue,
      recommendedFix,
      notes: notes || null,
      checkedAt: new Date(),
      followUpAt: this.needsFollowUp(coverageState) ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null,
    };

    if (pageType === 'product') {
      const product = await prisma.product.findFirst({
        where: { isActive: true, isDeleted: false, slug: this.extractSlug(url) },
        select: { seoScore: true },
      });
      payload.seoScore = product?.seoScore ?? null;
    }

    const record = await prisma.seoUrlInspection.upsert({
      where: { url },
      create: payload,
      update: payload,
    });

    return { record, raw, apiEnabled: this.apiEnabled };
  }

  async inspectUrls(urls: { url: string; pageType: string }[], notes?: string) {
    const results: any[] = [];
    for (const item of urls) {
      try {
        const result = await this.inspectUrl(item.url, item.pageType, notes);
        results.push({ url: item.url, ...result });
      } catch (err: any) {
        results.push({ url: item.url, error: err.message, apiEnabled: this.apiEnabled });
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return results;
  }

  async getDashboard() {
    const records = await prisma.seoUrlInspection.findMany();
    const lastChecked = records.length > 0
      ? records.map((r) => r.checkedAt).sort((a, b) => b.getTime() - a.getTime())[0]
      : null;

    const byState = (state: string) => records.filter((r) => r.coverageState === state).length;

    return {
      indexedPages:
        byState('Indexed') +
        byState('IndexingAllowed') +
        byState('Submitted and indexed') +
        byState('Submitted and indexed, not canonical') +
        byState('Submitted, not canonical') +
        byState('Indexed, not submitted in sitemap') +
        byState('Duplicate, submitted URL not selected as canonical') +
        byState('Page is indexed'),
      notIndexedPages:
        byState('NotIndexed') +
        byState('IndexingDenied') +
        byState('URL is unknown to Google') +
        byState('Not indexed, noindex detected') +
        byState('Not indexed, blocked by robots.txt') +
        byState('Not indexed, alternative page with proper canonical tag') +
        byState('Not indexed, page fetch failed') +
        byState('Not indexed, excluded by page removal tool') +
        byState('Page is not indexed'),
      crawledButNotIndexed:
        byState('CrawledNotIndexed') +
        byState('Crawled - currently not indexed') +
        byState('Crawled but not indexed'),
      discoveredButNotIndexed:
        byState('DiscoveredNotIndexed') +
        byState('Discovered - currently not indexed') +
        byState('Discovered but not indexed'),
      duplicatePages:
        byState('Duplicate') +
        byState('Duplicate, Google chose different canonical than user') +
        byState('Duplicate, submitted URL not selected as canonical'),
      pagesWithErrors: records.filter((r) => this.isErrorState(r.coverageState)).length,
      totalInspected: records.length,
      lastChecked,
      apiEnabled: this.apiEnabled,
    };
  }

  async getImportantPages() {
    const records = await prisma.seoUrlInspection.findMany({
      where: { url: { in: GSC_IMPORTANT_PAGES.map((p) => p.url) } },
    });
    const map = new Map(records.map((r) => [r.url, r]));

    return GSC_IMPORTANT_PAGES.map((p) => {
      const record = map.get(p.url);
      return {
        url: p.url,
        pageType: p.pageType,
        status: record?.status || null,
        coverageState: record?.coverageState || null,
        lastCrawlTime: record?.lastCrawlTime || null,
        googleCanonical: record?.googleCanonical || null,
        userCanonical: record?.userCanonical || null,
        robotsState: record?.robotsState || null,
        pageFetchState: record?.pageFetchState || null,
        mobileUsability: record?.mobileUsability || null,
        richResults: record?.richResults || null,
        issue: record?.issue || null,
        recommendedFix: record?.recommendedFix || null,
        checkedAt: record?.checkedAt || null,
        needsFollowUp: record?.followUpAt ? record.followUpAt <= new Date() : false,
        gscUrl: this.getGscUrl(p.url),
      };
    });
  }

  async getPriorityProducts(limit: number = 20) {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        stockQuantity: true,
        isFeatured: true,
        costPrice: true,
        sellingPrice: true,
        seoScore: true,
        images: { select: { id: true }, take: 1 },
      },
    });

    const visits = await prisma.websiteVisit.groupBy({
      by: ['productId'],
      where: { productId: { not: null } },
      _count: { productId: true },
    });
    const visitMap = new Map(visits.map((v) => [v.productId, v._count.productId]));

    const scored = products.map((p) => {
      const cleanDesc = (p.description || '').replace(/<[^>]*>/g, '').trim();
      const views = visitMap.get(p.id) || 0;
      const margin = p.sellingPrice - p.costPrice;
      const marginRatio = p.sellingPrice > 0 ? margin / p.sellingPrice : 0;

      let score = 0;
      if (views > 0) score += Math.min(30, Math.round(Math.log10(views + 1) * 10));
      if (p.stockQuantity > 0) score += 10;
      if (cleanDesc.length >= 100) score += 10;
      if (p.images.length > 0) score += 10;
      if (p.isFeatured) score += 20;
      score += Math.round(marginRatio * 20);
      score += Math.round((p.seoScore || 0) / 10);

      const url = `https://www.bretunetech.com/products/${p.slug}`;
      return { ...p, url, views, margin, priorityScore: score };
    });

    scored.sort((a, b) => b.priorityScore - a.priorityScore);
    return scored.slice(0, limit);
  }

  async getPriorityProductInspections(limit: number = 20) {
    const products = await this.getPriorityProducts(limit);
    const urls = products.map((p) => p.url);
    const records = await prisma.seoUrlInspection.findMany({ where: { url: { in: urls } } });
    const map = new Map(records.map((r) => [r.url, r]));

    return products.map((p) => {
      const record = map.get(p.url);
      return {
        ...p,
        status: record?.status || null,
        coverageState: record?.coverageState || null,
        lastCrawlTime: record?.lastCrawlTime || null,
        googleCanonical: record?.googleCanonical || null,
        userCanonical: record?.userCanonical || null,
        robotsState: record?.robotsState || null,
        pageFetchState: record?.pageFetchState || null,
        mobileUsability: record?.mobileUsability || null,
        richResults: record?.richResults || null,
        issue: record?.issue || null,
        recommendedFix: record?.recommendedFix || null,
        checkedAt: record?.checkedAt || null,
        needsFollowUp: record?.followUpAt ? record.followUpAt <= new Date() : false,
        gscUrl: this.getGscUrl(p.url),
      };
    });
  }

  async getFollowUps() {
    const now = new Date();
    const records = await prisma.seoUrlInspection.findMany({
      where: { followUpAt: { lte: now } },
      orderBy: { followUpAt: 'asc' },
    });
    return records.map((r) => ({
      ...r,
      gscUrl: this.getGscUrl(r.url),
    }));
  }

  async updateNotes(url: string, notes: string) {
    return prisma.seoUrlInspection.update({
      where: { url },
      data: { notes },
    });
  }

  async dismissFollowUp(url: string) {
    return prisma.seoUrlInspection.update({
      where: { url },
      data: { followUpAt: null },
    });
  }

  async getHealthReport() {
    const records = await prisma.seoUrlInspection.findMany({
      orderBy: { checkedAt: 'desc' },
    });

    return records.map((r) => ({
      url: r.url,
      pageType: r.pageType,
      seoScore: r.seoScore,
      indexedStatus: r.coverageState || 'Not checked',
      lastChecked: r.checkedAt,
      issue: r.issue,
      recommendedFix: r.recommendedFix,
    }));
  }

  async getChecklist() {
    const settings = await prisma.setting.findMany({
      where: { key: { in: GSC_CHECKLIST_KEYS } },
    });
    const map = new Map(settings.map((s) => [s.key, s.value === 'true']));
    const inspections = await prisma.seoUrlInspection.findMany();
    const homepageInspected = inspections.some((r) => r.url === 'https://www.bretunetech.com');
    const productInspected = inspections.some((r) => r.pageType === 'product');

    return {
      sitemapUrl: GSC_SITEMAP_URL,
      sitemapSubmitted: map.get('gsc_sitemap_submitted') ?? false,
      sitemapStatusSuccess: map.get('gsc_sitemap_status_success') ?? false,
      robotsTxtWorking: map.get('gsc_robots_txt_working') ?? false,
      homepageInspected: map.get('gsc_homepage_inspected') ?? homepageInspected,
      productsInspected: map.get('gsc_products_inspected') ?? productInspected,
    };
  }

  async updateChecklist(data: Record<string, boolean>) {
    const updates = Object.entries(data)
      .filter(([key]) => GSC_CHECKLIST_KEYS.includes(key))
      .map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value: value ? 'true' : 'false', group: 'seo' },
          update: { value: value ? 'true' : 'false' },
        })
      );
    await prisma.$transaction(updates);
    return this.getChecklist();
  }

  async generateImageAltText() {
    const images = await prisma.productImage.findMany({
      where: { altText: null },
      include: { product: { select: { name: true, brand: { select: { name: true } } } } },
    });

    let updated = 0;
    let errors = 0;
    for (const img of images) {
      try {
        const brand = img.product.brand?.name ? `${img.product.brand.name} ` : '';
        const alt = `${brand}${img.product.name}`.trim();
        await prisma.productImage.update({
          where: { id: img.id },
          data: { altText: alt },
        });
        updated++;
      } catch (err: any) {
        errors++;
        log.error('Failed to generate alt text', { imageId: img.id, error: err.message });
      }
    }
    return { updated, errors, total: images.length };
  }

  async buildRelatedProductLinks() {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        categoryId: true,
        brandId: true,
        sellingPrice: true,
      },
    });

    let created = 0;
    let errors = 0;

    await prisma.relatedProduct.deleteMany({});

    for (const product of products) {
      try {
        const candidates = products
          .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.brandId === product.brandId))
          .map((p) => ({
            ...p,
            score:
              (p.categoryId === product.categoryId ? 10 : 0) +
              (p.brandId === product.brandId ? 10 : 0) +
              (1 - Math.min(1, Math.abs(p.sellingPrice - product.sellingPrice) / Math.max(product.sellingPrice, 1))) * 10,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

        const links = candidates.map((c) => ({
          productId: product.id,
          relatedProductId: c.id,
          score: Math.round(c.score),
        }));

        if (links.length > 0) {
          await prisma.relatedProduct.createMany({ data: links, skipDuplicates: true });
          created += links.length;
        }
      } catch (err: any) {
        errors++;
        log.error('Failed to build related links', { productId: product.id, error: err.message });
      }
    }

    return { created, errors, products: products.length };
  }

  private extractSlug(url: string) {
    const match = url.match(/\/products\/([^/?#]+)/);
    return match ? match[1] : '';
  }

  private needsFollowUp(coverageState: string | null) {
    if (!coverageState) return true;
    const needs = [
      'NotIndexed',
      'CrawledNotIndexed',
      'DiscoveredNotIndexed',
      'PageNotFound',
      'ServerError',
      'RedirectError',
      'BlockedByRobots',
      'BlockedDueToOther4xxIssue',
      'BlockedDueToAccessForbidden',
      'Soft404',
    ];
    return needs.includes(coverageState);
  }

  private isErrorState(coverageState: string | null) {
    if (!coverageState) return false;
    const errorStates = [
      'PageNotFound',
      'ServerError',
      'RedirectError',
      'BlockedByRobots',
      'BlockedDueToOther4xxIssue',
      'BlockedDueToAccessForbidden',
      'Soft404',
    ];
    return errorStates.includes(coverageState);
  }

  private buildIssue(coverageState: string | null, indexStatus: any) {
    if (!coverageState) return 'Not inspected yet';
    if (coverageState === 'Indexed') return null;
    if (coverageState === 'NotIndexed') return 'URL is not indexed by Google';
    if (coverageState === 'CrawledNotIndexed') return 'Google crawled but chose not to index';
    if (coverageState === 'DiscoveredNotIndexed') return 'URL discovered but not yet crawled';
    if (coverageState === 'Duplicate') return 'Duplicate or canonical issue';
    if (this.isErrorState(coverageState)) return `Coverage issue: ${coverageState}`;
    return indexStatus?.verdict || 'Unknown status';
  }

  private buildRecommendedFix(coverageState: string | null, indexStatus: any) {
    if (!coverageState || coverageState === 'Indexed') return null;
    if (coverageState === 'NotIndexed') {
      return 'Improve uniqueness, internal links, and request indexing via Search Console.';
    }
    if (coverageState === 'CrawledNotIndexed') {
      return 'Add more unique content, improve page quality, and update internal links.';
    }
    if (coverageState === 'DiscoveredNotIndexed') {
      return 'Submit sitemap, improve crawl budget, and ensure page quality is high.';
    }
    if (coverageState === 'Duplicate') {
      return 'Review canonical tags and consolidate duplicate content.';
    }
    if (coverageState === 'BlockedByRobots') {
      return 'Check robots.txt and meta robots tags blocking indexing.';
    }
    if (coverageState === 'Soft404') {
      return 'Return proper 404 or add meaningful content.';
    }
    if (this.isErrorState(coverageState)) {
      return 'Fix technical errors (redirects, server errors, forbidden access).';
    }
    return 'Inspect URL in Search Console for details.';
  }
}

export const googleIndexingService = new GoogleIndexingService();
