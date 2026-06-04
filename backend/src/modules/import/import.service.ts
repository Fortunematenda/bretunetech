import { parse } from 'csv-parse/sync';
import prisma from '../../lib/prisma';
import { uploadImageFromUrl } from '../../lib/cloudinary';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';
import { BadRequestError } from '../../lib/errors';
import {
  ManualImportDto,
  CsvRowDto,
  csvRowSchema,
  BulkImportSettings,
  autoMapCategory,
  calculateSellingPrice,
} from './import.dto';

const log = logger.child('ImportService');

export interface ImportResult {
  success: boolean;
  productId?: string;
  name: string;
  sku?: string;
  error?: string;
}

export interface BulkImportResult {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  results: ImportResult[];
}

export class ImportService {
  private runtimeGlobalMarkup: number | null = null;

  // ─── Resolve category slug to ID (create if missing) ──
  private async resolveCategoryId(categoryInput: string): Promise<string> {
    const slug = autoMapCategory(categoryInput);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return existing.id;

    // Auto-create category
    const name = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const created = await prisma.category.create({
      data: { name, slug, description: `Auto-created from import: "${categoryInput}"` },
    });

    log.info('Category auto-created', { slug, name, originalInput: categoryInput });
    return created.id;
  }

  // ─── Check for duplicate SKU ──────────────────────────
  private async isDuplicateSku(sku: string | undefined): Promise<boolean> {
    if (!sku || sku.trim() === '') return false;
    const existing = await prisma.product.findUnique({ where: { sku: sku.trim() } });
    return !!existing;
  }

  // ─── Check for duplicate slug ─────────────────────────
  private async getUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name);
    let counter = 0;
    while (true) {
      const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
      const existing = await prisma.product.findUnique({ where: { slug: testSlug } });
      if (!existing) return testSlug;
      counter++;
    }
  }

  // ─── Handle image upload ──────────────────────────────
  private async handleImage(
    imageUrl: string | undefined,
    productName: string,
    uploadImages: boolean
  ): Promise<{ url: string; altText: string } | null> {
    if (!imageUrl || imageUrl.trim() === '') return null;

    if (uploadImages) {
      const result = await uploadImageFromUrl(imageUrl.trim());
      if (result) {
        return { url: result.url, altText: productName };
      }
    }

    // Fallback: use original URL directly
    return { url: imageUrl.trim(), altText: productName };
  }

  // ─── Import a single product ──────────────────────────
  async importSingle(
    dto: ManualImportDto,
    globalMarkup: number = 25,
    uploadImages: boolean = true
  ): Promise<ImportResult> {
    try {
      // Check duplicate SKU
      if (dto.supplierSku && await this.isDuplicateSku(dto.supplierSku)) {
        return {
          success: false,
          name: dto.name,
          sku: dto.supplierSku,
          error: `Duplicate SKU: ${dto.supplierSku}`,
        };
      }

      // Resolve category
      const categoryId = await this.resolveCategoryId(dto.category);

      // Calculate price
      const markup = dto.markupPercentage ?? globalMarkup;
      const sellingPrice = dto.sellingPrice ?? calculateSellingPrice(dto.costPrice, markup);

      // Generate unique slug
      const slug = await this.getUniqueSlug(dto.name);

      // Handle image
      const image = await this.handleImage(dto.imageUrl, dto.name, uploadImages);

      // Create product
      const product = await prisma.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          categoryId,
          condition: dto.condition || 'NEW',
          costPrice: dto.costPrice,
          sellingPrice,
          stockQuantity: dto.stockQuantity ?? 0,
          lowStockThreshold: 5,
          supplierName: dto.supplierName || undefined,
          sku: dto.supplierSku || undefined,
          isActive: true,
          isFeatured: false,
          images: image
            ? { create: [{ url: image.url, altText: image.altText, sortOrder: 0, isPrimary: true }] }
            : undefined,
          tags: dto.tags?.length
            ? { create: dto.tags.map((t) => ({ tag: t })) }
            : undefined,
        },
      });

      log.info('Product imported', { id: product.id, name: product.name, sku: dto.supplierSku });

      return { success: true, productId: product.id, name: product.name, sku: dto.supplierSku };
    } catch (err: any) {
      log.error('Import failed', { name: dto.name, error: err.message });
      return { success: false, name: dto.name, sku: dto.supplierSku, error: err.message };
    }
  }

  // ─── Parse CSV buffer into rows ───────────────────────
  parseCsv(buffer: Buffer): { rows: CsvRowDto[]; errors: { row: number; error: string }[] } {
    let rawRows: any[];
    try {
      rawRows = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
    } catch (err: any) {
      throw new BadRequestError(`CSV parsing error: ${err.message}`);
    }

    if (rawRows.length === 0) {
      throw new BadRequestError('CSV file is empty');
    }

    if (rawRows.length > 500) {
      throw new BadRequestError('CSV too large. Maximum 500 rows per import.');
    }

    const rows: CsvRowDto[] = [];
    const errors: { row: number; error: string }[] = [];

    rawRows.forEach((raw, index) => {
      try {
        const parsed = csvRowSchema.parse(raw);
        rows.push(parsed);
      } catch (err: any) {
        const msg = err.issues
          ? err.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('; ')
          : err.message;
        errors.push({ row: index + 2, error: msg }); // +2 for 1-indexed + header
      }
    });

    return { rows, errors };
  }

  // ─── Preview CSV (parse without importing) ────────────
  previewCsv(
    buffer: Buffer,
    globalMarkup: number = 25
  ): {
    rows: Array<CsvRowDto & { sellingPrice: number; categorySlug: string }>;
    errors: { row: number; error: string }[];
  } {
    const { rows, errors } = this.parseCsv(buffer);

    const preview = rows.map((row) => ({
      ...row,
      sellingPrice: row.markup_percentage !== undefined
        ? calculateSellingPrice(row.cost_price, row.markup_percentage)
        : calculateSellingPrice(row.cost_price, globalMarkup),
      categorySlug: autoMapCategory(row.category),
    }));

    return { rows: preview, errors };
  }

  // ─── Bulk import from parsed CSV rows ─────────────────
  async bulkImport(
    rows: CsvRowDto[],
    settings: BulkImportSettings
  ): Promise<BulkImportResult> {
    const results: ImportResult[] = [];
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      const dto: ManualImportDto = {
        name: row.name,
        description: row.description,
        category: row.category,
        supplierName: row.supplier_name || undefined,
        supplierSku: row.supplier_sku || undefined,
        costPrice: row.cost_price,
        markupPercentage: row.markup_percentage,
        imageUrl: row.image_url || undefined,
        condition: row.condition || 'NEW',
        stockQuantity: row.stock_quantity,
        tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      };

      // Check duplicate
      if (settings.skipDuplicates && dto.supplierSku && await this.isDuplicateSku(dto.supplierSku)) {
        skipped++;
        results.push({
          success: false,
          name: dto.name,
          sku: dto.supplierSku,
          error: 'Skipped: duplicate SKU',
        });
        continue;
      }

      const result = await this.importSingle(dto, settings.globalMarkup, settings.uploadImages);
      results.push(result);

      if (result.success) {
        imported++;
      } else {
        failed++;
      }
    }

    log.info('Bulk import complete', { total: rows.length, imported, skipped, failed });

    return {
      total: rows.length,
      imported,
      skipped,
      failed,
      results,
    };
  }

  // ─── Get import settings (global markup) ──────────────
  async getGlobalMarkup(): Promise<number> {
    if (this.runtimeGlobalMarkup !== null) {
      return this.runtimeGlobalMarkup;
    }

    const fromEnv = parseFloat(process.env.DEFAULT_MARKUP_PERCENTAGE || '25');
    if (Number.isNaN(fromEnv) || fromEnv < 0 || fromEnv > 500) {
      return 25;
    }

    return fromEnv;
  }

  async setGlobalMarkup(markup: number): Promise<number> {
    const normalized = Number(markup);
    if (Number.isNaN(normalized) || normalized < 0 || normalized > 500) {
      throw new BadRequestError('Global markup must be between 0 and 500');
    }

    this.runtimeGlobalMarkup = normalized;
    log.info('Global markup updated', { markup: normalized });
    return normalized;
  }
}

export const importService = new ImportService();
