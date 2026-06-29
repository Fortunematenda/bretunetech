import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import prisma from '../../lib/prisma';
import { uploadImageFromUrl } from '../../lib/cloudinary';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';
import { seoService } from '../seo/seo.service';
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
  // Set when the product imported but its image could not be re-hosted to Cloudinary.
  imageError?: string;
}

export interface BulkImportResult {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  // Number of products imported without their image (re-hosting failed/skipped).
  imageFailed: number;
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

  // ─── Resolve brand name to brandId ────────────────
  private async resolveBrandId(brandName: string | undefined): Promise<string | undefined> {
    if (!brandName || brandName.trim() === '') return undefined;
    const brand = await prisma.brand.findFirst({
      where: { name: { equals: brandName.trim(), mode: 'insensitive' } },
    });
    return brand?.id;
  }

  // ─── Check for duplicate SKU ──────────────────────────
  private async isDuplicateSku(sku: string | undefined): Promise<boolean> {
    if (!sku || sku.trim() === '') return false;
    const existing = await prisma.product.findFirst({ where: { sku: sku.trim(), isActive: true } });
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

  // ─── Parse specifications from string format "key:value|key:value" ──────────────────────────────
  private parseSpecifications(specsString: string): { key: string; value: string; sortOrder?: number }[] {
    if (!specsString || specsString.trim() === '') return [];
    return specsString.split('|')
      .map((spec, index) => {
        const [key, value] = spec.split(':');
        if (!key || !value) return null;
        return { key: key.trim(), value: value.trim(), sortOrder: index };
      })
      .filter((spec): spec is { key: string; value: string; sortOrder: number } => spec !== null);
  }

  // ─── Handle image upload ──────────────────────────────
  private async handleImage(
    imageUrl: string | undefined,
    productName: string,
    uploadImages: boolean
  ): Promise<{ images: { url: string; altText: string }[]; imageError: string | null }> {
    if (!imageUrl || imageUrl.trim() === '') return { images: [], imageError: null };

    const trimmed = imageUrl.trim();

    // Split by comma for multiple images, then by pipe for fallback URLs per image
    const imageGroups = trimmed.split(',').map(g => g.trim()).filter(g => g.length > 0);
    const uploadedImages: { url: string; altText: string }[] = [];
    let uploadError: string | null = null;

    for (const group of imageGroups) {
      // Locally-hosted asset paths (e.g. manual products using /assets/...) are
      // already served by us — keep them as-is, never send them to Cloudinary.
      if (group.startsWith('/')) {
        uploadedImages.push({ url: group, altText: productName });
        continue;
      }

      // Remote supplier URLs must be re-hosted to Cloudinary. We never persist the
      // raw supplier hot-link, because those are usually not publicly reachable.
      if (!uploadImages) {
        uploadError = `Image not re-hosted (image upload disabled): ${group}`;
        continue;
      }

      // Split by pipe character and try each URL until one succeeds
      const urls = group.split('|').map(u => u.trim()).filter(u => u.length > 0);

      for (const url of urls) {
        const result = await uploadImageFromUrl(url);
        if (result?.url) {
          uploadedImages.push({ url: result.url, altText: productName });
          break;
        }
      }

      if (uploadedImages.length < imageGroups.indexOf(group) + 1) {
        uploadError = `Image upload failed (Cloudinary not configured or fetch failed): ${group}`;
      }
    }

    return {
      images: uploadedImages,
      imageError: uploadError,
    };
  }

  // ─── Update an existing product (matched by SKU) ──────
  // Refreshes stock/prices and, when an image_url is supplied, re-hosts it to
  // Cloudinary (or keeps a local /assets path) and replaces the current image.
  // A failed upload leaves the existing image intact — never a supplier hot-link.
  private async updateExistingBySku(
    dto: ManualImportDto,
    opts: { globalMarkup: number; uploadImages: boolean; addVatToCost: boolean; vatRate: number }
  ): Promise<{ updated: number; imageError: string | null }> {
    // [DEBUG] temporary — remove after diagnosing CSV image import
    log.info('[DEBUG] updateExistingBySku: duplicate SKU update path', {
      sku: dto.supplierSku,
      hasImageUrl: Boolean(dto.imageUrl && dto.imageUrl.trim()),
      uploadImages: opts.uploadImages,
    });

    const costWithVat = opts.addVatToCost
      ? Math.round((dto.costPrice ?? 0) * (1 + (opts.vatRate ?? 15) / 100) * 100) / 100
      : dto.costPrice ?? 0;
    const markup = dto.markupPercentage ?? opts.globalMarkup;
    const sellingPrice = dto.sellingPrice ?? calculateSellingPrice(costWithVat, markup);

    const { images, imageError } = await this.handleImage(dto.imageUrl, dto.name, opts.uploadImages);

    const existing = await prisma.product.findMany({
      where: { sku: dto.supplierSku!.trim(), isActive: true },
      select: { id: true },
    });

    for (const p of existing) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          stockCpt: dto.stockCpt ?? 0,
          stockJhb: dto.stockJhb ?? 0,
          stockDbn: dto.stockDbn ?? 0,
          stockQuantity: dto.stockQuantity ?? 0,
          costPrice: costWithVat,
          sellingPrice,
          ...(dto.additionalInfo !== undefined && { additionalInfo: dto.additionalInfo }),
          ...(dto.specifications !== undefined && {
            specifications: {
              deleteMany: {},
              create: dto.specifications,
            },
          }),
        },
      });

      // Only replace the existing images when we have valid ones (Cloudinary
      // upload succeeded, or a local /assets path). On failure leave them untouched.
      if (images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: p.id } });
        await prisma.productImage.createMany({
          data: images.map((img, i) => ({
            productId: p.id,
            url: img.url,
            altText: img.altText,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        });
      }
    }

    // [DEBUG] temporary — remove after diagnosing CSV image import
    log.info('[DEBUG] updateExistingBySku: done', {
      sku: dto.supplierSku,
      productsUpdated: existing.length,
      imagesReplaced: images.length,
      imageError,
    });

    return { updated: existing.length, imageError };
  }

  // ─── Import a single product ──────────────────────────
  async importSingle(
    dto: ManualImportDto,
    globalMarkup: number = 35,
    uploadImages: boolean = true,
    addVatToCost: boolean = false,
    vatRate: number = 15
  ): Promise<ImportResult> {
    try {
      // Remove any soft-deleted product with same SKU so it doesn't block unique constraint
      if (dto.supplierSku) {
        await prisma.product.deleteMany({
          where: { sku: dto.supplierSku.trim(), isActive: false },
        });
      }

      // Existing SKU — update stock/prices and refresh the image instead of erroring
      if (dto.supplierSku && await this.isDuplicateSku(dto.supplierSku)) {
        const { imageError } = await this.updateExistingBySku(dto, {
          globalMarkup,
          uploadImages,
          addVatToCost,
          vatRate,
        });
        return {
          success: true,
          name: dto.name,
          sku: dto.supplierSku,
          error: 'Updated existing product',
          imageError: imageError || undefined,
        };
      }

      // Resolve category
      const categoryId = await this.resolveCategoryId(dto.category);

      // Calculate price — optionally inflate cost by VAT before applying markup
      const costWithVat = addVatToCost
        ? Math.round(dto.costPrice * (1 + vatRate / 100) * 100) / 100
        : dto.costPrice;
      const markup = dto.markupPercentage ?? globalMarkup;
      const sellingPrice = dto.sellingPrice ?? calculateSellingPrice(costWithVat, markup);

      // Generate unique slug
      const slug = await this.getUniqueSlug(dto.name);

      // Handle image
      const { images, imageError } = await this.handleImage(dto.imageUrl, dto.name, uploadImages);

      // Create product
      const brandId = await this.resolveBrandId(dto.brandName);

      // Auto-generate SEO fields
      const seoFields = seoService.generateSeoForProduct({
        name: dto.name,
        description: dto.description,
        brand: dto.brandName ? { name: dto.brandName } : null,
        category: null, // category name not available here
      });

      const product = await prisma.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          categoryId,
          condition: dto.condition || 'NEW',
          costPrice: costWithVat,
          sellingPrice,
          originalPrice: dto.originalPrice,
          stockQuantity: dto.stockQuantity ?? 0,
          stockCpt: dto.stockCpt ?? 0,
          stockJhb: dto.stockJhb ?? 0,
          stockDbn: dto.stockDbn ?? 0,
          lowStockThreshold: dto.lowStockThreshold ?? 5,
          shippingDays: dto.shippingDays ?? 3,
          supplierName: dto.supplierName || undefined,
          sku: dto.supplierSku || undefined,
          brandId: brandId || undefined,
          isActive: true,
          isFeatured: dto.isFeatured ?? false,
          additionalInfo: dto.additionalInfo || undefined,
          metaTitle: seoFields.metaTitle,
          metaDescription: seoFields.metaDescription,
          focusKeyword: seoFields.focusKeyword,
          images: images.length > 0
            ? { create: images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i, isPrimary: i === 0 })) }
            : undefined,
          tags: dto.tags?.length
            ? { create: dto.tags.map((t) => ({ tag: t })) }
            : undefined,
          specifications: dto.specifications?.length
            ? { create: dto.specifications }
            : undefined,
        },
      });

      log.info('Product imported', { id: product.id, name: product.name, sku: dto.supplierSku, imageError });

      return {
        success: true,
        productId: product.id,
        name: product.name,
        sku: dto.supplierSku,
        imageError: imageError || undefined,
      };
    } catch (err: any) {
      log.error('Import failed', { name: dto.name, error: err.message });
      return { success: false, name: dto.name, sku: dto.supplierSku, error: err.message };
    }
  }

  // ─── Extract raw headers from CSV ─────────────────────
  getHeaders(buffer: Buffer): string[] {
    try {
      const fileType = this.detectFileType(buffer);
      
      if (fileType === 'excel') {
        const rawRows = this.parseExcel(buffer);
        return rawRows.length > 0 ? Object.keys(rawRows[0]).map((k) => k.replace(/^\uFEFF/, '').trim()) : [];
      } else {
        const rows = parse(buffer, { columns: true, skip_empty_lines: true, to: 1, bom: true });
        return rows.length > 0 ? Object.keys(rows[0]).map((k) => k.replace(/^\uFEFF/, '').trim()) : [];
      }
    } catch { return []; }
  }

  // ─── Normalise supplier column names to our schema ────
  private normaliseRow(raw: Record<string, any>): Record<string, any> {
    const MAP: Record<string, string> = {
      // name
      'product name': 'name', 'product': 'name', 'item name': 'name', 'item': 'name', 'title': 'name',
      'name': 'name', 'item description': 'name',
      // description
      'desc': 'description', 'product description': 'description', 'details': 'description', 'long description': 'description',
      // category
      'cat': 'category', 'product category': 'category', 'type': 'category', 'product type': 'category',
      // supplier_name
      'supplier': 'supplier_name', 'vendor': 'supplier_name', 'manufacturer': 'supplier_name',
      'supplier name': 'supplier_name', 'vendor name': 'supplier_name', 'manufacturer name': 'supplier_name',
      'source': 'supplier_name', 'distributor': 'supplier_name',
      'supplier id': 'supplier_name', 'vendor id': 'supplier_name',
      // brand
      'brand': 'brand', 'brand name': 'brand', 'make': 'brand', 'product brand': 'brand',
      // supplier_sku
      'sku': 'supplier_sku', 'part number': 'supplier_sku', 'part no': 'supplier_sku', 'part_no': 'supplier_sku',
      'item code': 'supplier_sku', 'item_code': 'supplier_sku', 'code': 'supplier_sku', 'product code': 'supplier_sku',
      'barcode': 'supplier_sku', 'upc': 'supplier_sku', 'mpn': 'supplier_sku',
      // cost_price
      'cost': 'cost_price', 'price': 'cost_price', 'unit price': 'cost_price', 'unit_price': 'cost_price',
      'cost price': 'cost_price', 'buy price': 'cost_price', 'purchase price': 'cost_price', 'wholesale price': 'cost_price',
      'excl': 'cost_price', 'excl price': 'cost_price', 'excl. price': 'cost_price',
      // image_url
      'image': 'image_url', 'img': 'image_url', 'photo': 'image_url', 'image link': 'image_url',
      'picture': 'image_url', 'photo url': 'image_url',
      // condition
      'cond': 'condition', 'product condition': 'condition',
      // stock_quantity
      'stock': 'stock_quantity', 'qty': 'stock_quantity', 'quantity': 'stock_quantity', 'in stock': 'stock_quantity',
      'available': 'stock_quantity', 'on hand': 'stock_quantity',
      // markup_percentage
      'markup': 'markup_percentage', 'margin': 'markup_percentage', 'markup %': 'markup_percentage',
      // selling_price / retail price
      'selling price': 'selling_price', 'sell price': 'selling_price', 'retail': 'selling_price',
      'retail price': 'selling_price', 'rrp': 'selling_price', 'incl': 'selling_price',
      'incl price': 'selling_price', 'incl. price': 'selling_price', 'sale price': 'selling_price',
      // cost / dealer price
      'dealer price': 'cost_price', 'dealer': 'cost_price', 'trade price': 'cost_price',
      'trade': 'cost_price', 'net price': 'cost_price', 'cost ex': 'cost_price',
      // stock from warehouse columns — use Total Stock if present
      'total stock': 'stock_quantity', 'total': 'stock_quantity',
      // warehouse-specific stock
      'cpt': 'stock_cpt', 'cape town': 'stock_cpt', 'capetown': 'stock_cpt',
      'jhb': 'stock_jhb', 'johannesburg': 'stock_jhb', 'joburg': 'stock_jhb', 'jnb': 'stock_jhb',
      'dbn': 'stock_dbn', 'durban': 'stock_dbn', 'dbn stock': 'stock_dbn',
      // additional_info
      'additional info': 'additional_info', 'additional': 'additional_info', 'extra info': 'additional_info',
      'notes': 'additional_info', 'warranty': 'additional_info', 'care instructions': 'additional_info',
      // specifications
      'specifications': 'specifications', 'specs': 'specifications', 'features': 'specifications',
      'attributes': 'specifications', 'spec': 'specifications',
    };
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      const cleanKey = k.replace(/^\uFEFF/, '').trim();
      const normalKey = cleanKey.toLowerCase().replace(/[_\-]+/g, ' ');
      // Convert undefined/null to empty string to avoid validation errors
      const value = (v === undefined || v === null) ? '' : v;
      out[MAP[normalKey] ?? cleanKey.toLowerCase().replace(/\s+/g, '_')] = value;
    }
    return out;
  }

  // ─── Detect file type and parse accordingly ─────────────
  private detectFileType(buffer: Buffer): 'csv' | 'excel' {
    // Check for Excel magic numbers
    const excelSignatures = [
      [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // XLS
      [0x50, 0x4B, 0x03, 0x04], // XLSX (ZIP)
    ];
    
    const firstBytes = Array.from(buffer.slice(0, 8));
    const isExcel = excelSignatures.some(sig => 
      sig.every((byte, i) => firstBytes[i] === byte)
    );
    
    return isExcel ? 'excel' : 'csv';
  }

  // ─── Parse Excel buffer into rows ─────────────────────
  private parseExcel(buffer: Buffer): any[] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestError('Excel file has no sheets');
    }
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
      defval: '',
      raw: false,
      dateNF: 'yyyy-mm-dd'
    });
    
    // Log first row for debugging
    if (jsonData.length > 0) {
      log.info('Excel first row data:', { firstRow: jsonData[0] });
    }
    
    // Filter out completely empty rows
    return jsonData.filter((row: any) => {
      return Object.values(row).some((val: any) => val !== '' && val !== null && val !== undefined);
    });
  }

  // ─── Parse CSV/Excel buffer into rows ───────────────────────
  parseCsv(buffer: Buffer): { rows: CsvRowDto[]; errors: { row: number; error: string }[] } {
    let rawRows: any[];
    const fileType = this.detectFileType(buffer);
    
    try {
      if (fileType === 'excel') {
        rawRows = this.parseExcel(buffer);
      } else {
        // Detect delimiter: try comma first, then semicolon
        const content = buffer.toString('utf-8');
        const firstLine = content.split('\n')[0] || '';
        const delimiter = firstLine.includes(';') ? ';' : ',';

        rawRows = parse(buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
          relax_column_count: true,
          delimiter,
          escape: '"',
          quote: '"',
        });
      }
    } catch (err: any) {
      throw new BadRequestError(`${fileType === 'excel' ? 'Excel' : 'CSV'} parsing error: ${err.message}`);
    }

    if (rawRows.length === 0) {
      throw new BadRequestError(`${fileType === 'excel' ? 'Excel' : 'CSV'} file is empty`);
    }


    const rows: CsvRowDto[] = [];
    const errors: { row: number; error: string }[] = [];

    rawRows.forEach((raw, index) => {
      try {
        const parsed = csvRowSchema.parse(this.normaliseRow(raw));
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

  // ─── Parse CSV/Excel with user-defined column map ───────────
  parseCsvWithMap(
    buffer: Buffer,
    columnMap: Record<string, string>  // { csvHeader: schemaField }
  ): { rows: CsvRowDto[]; errors: { row: number; error: string }[] } {
    let rawRows: any[];
    const fileType = this.detectFileType(buffer);
    
    try {
      if (fileType === 'excel') {
        rawRows = this.parseExcel(buffer);
      } else {
        // Detect delimiter: try comma first, then semicolon
        const content = buffer.toString('utf-8');
        const firstLine = content.split('\n')[0] || '';
        const delimiter = firstLine.includes(';') ? ';' : ',';

        rawRows = parse(buffer, { columns: true, skip_empty_lines: true, trim: true, bom: true, relax_column_count: true, delimiter, escape: '"', quote: '"' });
      }
    } catch (err: any) {
      throw new BadRequestError(`${fileType === 'excel' ? 'Excel' : 'CSV'} parsing error: ${err.message}`);
    }
    if (rawRows.length === 0) throw new BadRequestError(`${fileType === 'excel' ? 'Excel' : 'CSV'} file is empty`);

    const rows: CsvRowDto[] = [];
    const errors: { row: number; error: string }[] = [];

    // Collect schema fields the user explicitly mapped TO (non-empty) — autoNorm must not overwrite these.
    const userMappedSchemaFields = new Set(
      Object.values(columnMap).filter((v) => v !== '')
    );
    // Also block autoNorm for CSV headers the user explicitly marked as skip ('')
    // by finding what those headers would have auto-resolved to.
    const skippedAutoFields = new Set(
      Object.entries(columnMap)
        .filter(([, v]) => v === '')
        .map(([csvCol]) => {
          const autoNormed = this.normaliseRow({ [csvCol]: '' });
          return Object.keys(autoNormed)[0] ?? '';
        })
        .filter(Boolean)
    );
    const userTouchedSchemaFields = new Set([...userMappedSchemaFields, ...skippedAutoFields]);

    rawRows.forEach((raw, index) => {
      // Build a normalised key → original key lookup to handle BOM, spaces, casing
      const rawKeyMap: Record<string, string> = {};
      for (const k of Object.keys(raw)) {
        rawKeyMap[k.replace(/^\uFEFF/, '').trim().toLowerCase()] = k;
      }

      // Apply user map — empty schemaField means "skip this CSV column entirely"
      const userMapped: Record<string, any> = {};
      for (const [csvCol, schemaField] of Object.entries(columnMap)) {
        if (!schemaField) continue; // skip — user chose "— skip this column —"
        const csvColClean = csvCol.replace(/^\uFEFF/, '').trim();
        const originalKey = raw[csvCol] !== undefined
          ? csvCol
          : raw[csvColClean] !== undefined
            ? csvColClean
            : rawKeyMap[csvColClean.toLowerCase()];
        if (originalKey && raw[originalKey] !== undefined) {
          userMapped[schemaField] = raw[originalKey];
        }
      }

      // Auto-normalise ONLY columns the user never touched in the mapping UI
      const autoNorm = this.normaliseRow(raw);
      const filteredAutoNorm: Record<string, any> = {};
      for (const [field, value] of Object.entries(autoNorm)) {
        if (!userTouchedSchemaFields.has(field)) {
          filteredAutoNorm[field] = value;
        }
      }

      const out: Record<string, any> = { ...filteredAutoNorm, ...userMapped };
      try {
        rows.push(csvRowSchema.parse(out));
      } catch (err: any) {
        const msg = err.issues
          ? err.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('; ')
          : err.message;
        errors.push({ row: index + 2, error: msg });
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

  // ─── Preview CSV with column map ──────────────────────
  previewCsvWithMap(
    buffer: Buffer,
    columnMap: Record<string, string>,
    globalMarkup: number = 25
  ): {
    rows: Array<CsvRowDto & { sellingPrice: number; categorySlug: string }>;
    errors: { row: number; error: string }[];
  } {
    const { rows, errors } = this.parseCsvWithMap(buffer, columnMap);

    const preview = rows.map((row) => ({
      ...row,
      sellingPrice: (row as any).selling_price
        ? (row as any).selling_price
        : row.markup_percentage !== undefined
          ? calculateSellingPrice(row.cost_price, row.markup_percentage)
          : calculateSellingPrice(row.cost_price, globalMarkup),
      categorySlug: autoMapCategory(row.category ?? 'general'),
    }));

    return { rows: preview, errors };
  }

  // ─── Bulk import from parsed CSV rows ─────────────────
  async bulkImport(
    rows: CsvRowDto[],
    settings: BulkImportSettings
  ): Promise<BulkImportResult> {
    const BATCH_SIZE = 10;
    const allResults: ImportResult[] = [];
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    let imageFailed = 0;

    const processRow = async (row: CsvRowDto): Promise<ImportResult & { _skipped?: boolean }> => {
      const dto: ManualImportDto = {
        name: row.name,
        description: row.description,
        category: row.category,
        brandName: row.brand || undefined,
        supplierName: row.supplier_name || undefined,
        supplierSku: row.supplier_sku || undefined,
        costPrice: row.cost_price,
        markupPercentage: row.markup_percentage,
        sellingPrice: (row as any).sellingPrice || (row as any).selling_price || undefined,
        originalPrice: (row as any).originalPrice || (row as any).original_price || undefined,
        imageUrl: row.image_url || undefined,
        condition: row.condition || 'NEW',
        stockQuantity: row.stock_quantity,
        stockCpt: row.stock_cpt ?? 0,
        stockJhb: row.stock_jhb ?? 0,
        stockDbn: row.stock_dbn ?? 0,
        lowStockThreshold: (row as any).low_stock_threshold ?? 5,
        shippingDays: (row as any).shipping_days ?? 3,
        isFeatured: (row as any).is_featured ?? false,
        tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        additionalInfo: (row as any).additional_info || (row as any).additionalInfo || undefined,
        specifications: this.parseSpecifications((row as any).specifications || ''),
      };

      if (settings.skipDuplicates && dto.supplierSku && await this.isDuplicateSku(dto.supplierSku)) {
        try {
          const { imageError } = await this.updateExistingBySku(dto, {
            globalMarkup: settings.globalMarkup,
            uploadImages: settings.uploadImages,
            addVatToCost: settings.addVatToCost ?? false,
            vatRate: settings.vatRate ?? 15,
          });
          return {
            success: true,
            name: dto.name,
            sku: dto.supplierSku,
            error: 'Updated existing product',
            imageError: imageError || undefined,
            _skipped: true,
          };
        } catch (e: any) {
          return { success: false, name: dto.name, sku: dto.supplierSku, error: `Update failed: ${e.message}`, _skipped: true };
        }
      }

      return this.importSingle(dto, settings.globalMarkup, settings.uploadImages, settings.addVatToCost, settings.vatRate);
    };

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(processRow));

      for (const result of batchResults) {
        const { _skipped, ...clean } = result as any;
        allResults.push(clean);
        if (_skipped) {
          skipped++;
          if (clean.imageError) imageFailed++;
        } else if (clean.success) {
          imported++;
          if (clean.imageError) imageFailed++;
        } else {
          failed++;
        }
      }
    }

    log.info('Bulk import complete', { total: rows.length, imported, skipped, failed, imageFailed });

    return {
      total: rows.length,
      imported,
      skipped,
      failed,
      imageFailed,
      results: allResults,
    };
  }

  // ─── Get import settings (global markup) ──────────────
  async getGlobalMarkup(): Promise<number> {
    if (this.runtimeGlobalMarkup !== null) {
      return this.runtimeGlobalMarkup;
    }

    const fromEnv = parseFloat(process.env.DEFAULT_MARKUP_PERCENTAGE || '35');
    if (Number.isNaN(fromEnv) || fromEnv < 0 || fromEnv > 500) {
      return 35;
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
