import { productRepository } from './product.repository';
import { CreateProductDto, UpdateProductDto, ListProductsDto } from './product.dto';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';
import { seoService } from '../seo/seo.service';
import { specsService } from '../specs/specs.service';
import prisma from '../../lib/prisma';

const log = logger.child('ProductService');

export class ProductService {
  async listProducts(filters: ListProductsDto) {
    const { products, total, page, limit } = await productRepository.findMany(filters);
    const isAdminListing = filters.status === 'all';

    return {
      products: isAdminListing ? products : products.map((product) => this.presentForStorefront(product)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (product?.isActive && !product.isDeleted && product.status === 'PUBLISHED') return this.presentForStorefront(product);

    const redirect = await prisma.productRedirect.findUnique({
      where: { oldSlug: slug },
      include: { product: true },
    });
    if (redirect?.product.isActive && !redirect.product.isDeleted && redirect.product.status === 'PUBLISHED') {
      return { ...this.presentForStorefront(redirect.product), redirectSlug: redirect.newSlug };
    }

    throw new NotFoundError('Product');
  }

  private presentForStorefront(product: any) {
    const displayName = product.displayName?.trim() || product.name;

    // Strip SEO filler sentences; keep the rest of the product copy.
    const clean = (value?: string | null) => seoService.stripBoilerplateSentences(value);

    const originalDescription = [product.description, product.supplierDescription]
      .map((value) => clean(typeof value === 'string' ? value : ''))
      .find((value) => !!value) || '';

    const fullDescription = clean(product.fullDescription) || originalDescription;
    const shortDescription = clean(product.shortDescription) || fullDescription || originalDescription;
    const description = fullDescription || shortDescription || originalDescription || '';

    return {
      ...product,
      name: displayName,
      description,
      displayName,
      shortDescription: shortDescription || description,
      fullDescription: description,
      images: product.images?.map((image: any) => ({
        ...image,
        altText: image.altText?.trim() || product.imageAltText?.trim() || displayName,
      })),
    };
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const slug = await this.getAvailableSlug(generateSlug(dto.name), dto.sku);

    log.info('Creating product with data:', {
      specifications: dto.specifications,
      manualUrl: dto.manualUrl,
      additionalInfo: dto.additionalInfo
    });

    // Auto-assign "best seller" tag if isBestSeller is true
    let tags = dto.tags || [];
    if (dto.isBestSeller && !tags.includes('best seller')) {
      tags = [...tags, 'best seller'];
    }

    const product = await productRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      categoryId: dto.categoryId,
      condition: dto.condition,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      originalPrice: dto.originalPrice,
      discountExpiresAt: dto.discountExpiresAt ? new Date(dto.discountExpiresAt) : undefined,
      stockQuantity: dto.stockQuantity,
      lowStockThreshold: dto.lowStockThreshold,
      shippingDays: dto.shippingDays,
      supplierName: dto.supplierName,
      sku: dto.sku,
      isFeatured: dto.isFeatured,
      isBestSeller: dto.isBestSeller,
      brandId: dto.brandId,
      images: dto.images,
      tags,
      specifications: dto.specifications,
      manualUrl: dto.manualUrl,
      additionalInfo: dto.additionalInfo,
    });

    log.info('Product created', { id: product.id, name: product.name });
    // Auto-generate SEO asynchronously (non-blocking)
    seoService.autoGenerateForProduct(product.id).catch(() => {});
    // Auto-extract specs from additional info (non-blocking)
    if (dto.additionalInfo) {
      specsService.autoExtractOnSave(product.id, dto.additionalInfo).catch(() => {});
    }
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.getProductById(id); // Ensure exists

    const data: any = { ...dto };
    delete data.slug;
    if (dto.slug && dto.slug !== existingProduct.slug) {
      const nextSlug = await this.getAvailableSlug(dto.slug, existingProduct.sku, id);
      data.slug = nextSlug;
      await prisma.productRedirect.upsert({
        where: { oldSlug: existingProduct.slug },
        create: { productId: id, oldSlug: existingProduct.slug, newSlug: nextSlug },
        update: { productId: id, newSlug: nextSlug },
      });
    }
    if (dto.discountExpiresAt) {
      data.discountExpiresAt = new Date(dto.discountExpiresAt);
    }

    // Auto-assign/remove "best seller" tag when isBestSeller changes
    if (dto.isBestSeller !== undefined) {
      const existingTags = existingProduct.tags?.map((t: any) => t.tag) || [];
      let newTags = [...existingTags];

      if (dto.isBestSeller && !newTags.includes('best seller')) {
        newTags.push('best seller');
      } else if (!dto.isBestSeller && newTags.includes('best seller')) {
        newTags = newTags.filter(tag => tag !== 'best seller');
      }

      data.tags = newTags;
    }

    const product = await productRepository.update(id, data);
    log.info('Product updated', { id: product.id, name: product.name });
    // Recalculate SEO score asynchronously (non-blocking)
    seoService.autoGenerateForProduct(product.id).catch(() => {});
    // Auto-extract specs from additional info (non-blocking)
    if (dto.additionalInfo) {
      specsService.autoExtractOnSave(product.id, dto.additionalInfo).catch(() => {});
    }
    return product;
  }

  async deleteProduct(id: string) {
    await this.getProductById(id); // Ensure exists
    await productRepository.hardDelete(id);
    log.info('Product deleted', { id });
    return { message: 'Product deleted' };
  }

  async adjustStock(id: string, quantityChange: number) {
    const product = await this.getProductById(id);
    const newQuantity = product.stockQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new ConflictError(`Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`);
    }

    await productRepository.updateStock(id, quantityChange);
    log.info('Stock adjusted', { id, change: quantityChange, newQuantity });
  }

  async getLowStockProducts() {
    return productRepository.findLowStock();
  }

  async exportProducts(filters: any = {}) {
    const products = await productRepository.findManyForExport(filters);
    // Convert to CSV
    const headers = ['ID', 'Name', 'SKU', 'Description', 'Category', 'Brand', 'Condition', 'Selling Price', 'Cost Price', 'Original Price', 'Stock Quantity', 'Stock CPT', 'Stock JHB', 'Stock DBN', 'Low Stock Threshold', 'Shipping Days', 'Is Featured', 'Is Active', 'Tags', 'Image URLs', 'Specifications', 'Additional Info', 'Created At'];
    const rows = products.map((p: any) => [
      p.id,
      p.name,
      p.sku || '',
      p.description || '',
      p.category?.name || '',
      p.brand?.name || '',
      p.condition || '',
      p.sellingPrice,
      p.costPrice || '',
      p.originalPrice || '',
      p.stockQuantity,
      p.stockCpt ?? 0,
      p.stockJhb ?? 0,
      p.stockDbn ?? 0,
      p.lowStockThreshold ?? 5,
      p.shippingDays ?? 3,
      p.isFeatured,
      p.isActive,
      // Tags as comma-separated
      p.tags && p.tags.length > 0 ? p.tags.map((t: any) => t.tag).join(', ') : '',
      // Join all image URLs with pipe separator
      p.images && p.images.length > 0 ? p.images.map((img: any) => img.url).join(' | ') : '',
      // Join specifications as key:value pairs with pipe separator
      p.specifications && p.specifications.length > 0 
        ? p.specifications.map((spec: any) => `${spec.key}:${spec.value}`).join(' | ') 
        : '',
      p.additionalInfo || '',
      p.createdAt
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const cellStr = String(cell ?? '');
        // Escape quotes and wrap in quotes if contains comma or quote
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');
    return csvContent;
  }

  private async getAvailableSlug(baseSlug: string, sku?: string | null, excludeProductId?: string): Promise<string> {
    const cleanBase = generateSlug(baseSlug).slice(0, 80) || 'product';
    const suffix = sku ? generateSlug(sku).slice(0, 24) : '';
    const candidates = [cleanBase, suffix ? `${cleanBase}-${suffix}`.slice(0, 100) : cleanBase];

    for (const candidate of candidates) {
      const existing = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
      if (!existing || existing.id === excludeProductId) return candidate;
    }

    let attempt = 2;
    while (true) {
      const candidate = `${candidates[candidates.length - 1]}-${attempt}`.slice(0, 100);
      const existing = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
      if (!existing || existing.id === excludeProductId) return candidate;
      attempt += 1;
    }
  }

  async recalculateBestSellers(days: number = 30, topCount: number = 20) {
    log.info('Recalculating best sellers', { days, topCount });

    // Calculate the date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    // Get sales data from orders in the time period
    const salesData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { not: null },
        order: {
          createdAt: { gte: thresholdDate },
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] }
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: topCount
    });

    const bestSellerProductIds = salesData
      .filter((item: any) => item._sum.quantity > 0)
      .map((item: any) => item.productId);

    log.info('Top selling products', { count: bestSellerProductIds.length, ids: bestSellerProductIds });

    // Update isBestSeller for all products
    // First, set all to false
    await prisma.product.updateMany({
      where: { isDeleted: false },
      data: { isBestSeller: false }
    });

    // Then set best sellers to true
    if (bestSellerProductIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: bestSellerProductIds },
          isDeleted: false
        },
        data: { isBestSeller: true }
      });
    }

    log.info('Best sellers updated', { count: bestSellerProductIds.length });

    return {
      message: 'Best sellers recalculated successfully',
      bestSellersCount: bestSellerProductIds.length,
      topProducts: bestSellerProductIds
    };
  }

  /**
   * Storefront "You Might Also Like" — prefers curated RelatedProduct rows,
   * then fills with category/brand/name/price-scored candidates.
   */
  async getRelatedProducts(slug: string, limit = 8) {
    const product = await productRepository.findBySlug(slug);
    if (!product?.isActive || product.isDeleted || product.status !== 'PUBLISHED') {
      throw new NotFoundError('Product');
    }

    const include = {
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      tags: true,
    };

    const selected = new Map<string, any>();

    const curatedLinks = await prisma.relatedProduct.findMany({
      where: { productId: product.id },
      orderBy: { score: 'desc' },
      take: limit * 2,
    });

    if (curatedLinks.length > 0) {
      const byId = new Map(
        (
          await prisma.product.findMany({
            where: {
              id: { in: curatedLinks.map((l) => l.relatedProductId) },
              isActive: true,
              isDeleted: false,
              status: 'PUBLISHED',
              noIndex: false,
            },
            include,
          })
        ).map((p) => [p.id, p])
      );

      for (const link of curatedLinks) {
        const related = byId.get(link.relatedProductId);
        if (!related || selected.has(related.id)) continue;
        selected.set(related.id, related);
        if (selected.size >= limit) break;
      }
    }

    if (selected.size < limit) {
      const orFilters: any[] = [];
      if (product.categoryId) orFilters.push({ categoryId: product.categoryId });
      if (product.brandId) orFilters.push({ brandId: product.brandId });

      const candidates = await prisma.product.findMany({
        where: {
          id: {
            not: product.id,
            ...(selected.size > 0 ? { notIn: [...selected.keys()] } : {}),
          },
          isActive: true,
          isDeleted: false,
          status: 'PUBLISHED',
          noIndex: false,
          ...(orFilters.length > 0 ? { OR: orFilters } : {}),
        },
        include,
        take: 120,
        orderBy: { updatedAt: 'desc' },
      });

      const scored = candidates
        .map((candidate) => ({
          product: candidate,
          score: this.scoreRelatedCandidate(product, candidate),
        }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score);

      const usedNormalizedNames = new Set(
        [...selected.values()].map((p) => this.normalizeProductName(p.name || p.displayName || ''))
      );

      for (const row of scored) {
        const norm = this.normalizeProductName(row.product.name || row.product.displayName || '');
        if (!norm || usedNormalizedNames.has(norm)) continue;
        // Skip near-identical titles (same SKU family already on page)
        if (this.namesTooSimilar(product.name, row.product.name)) continue;
        usedNormalizedNames.add(norm);
        selected.set(row.product.id, row.product);
        if (selected.size >= limit) break;
      }
    }

    // Last resort: in-stock bestsellers from same category only already tried;
    // if still short, pull popular published products excluding selected.
    if (selected.size < Math.min(4, limit)) {
      const fillers = await prisma.product.findMany({
        where: {
          id: {
            not: product.id,
            ...(selected.size > 0 ? { notIn: [...selected.keys()] } : {}),
          },
          isActive: true,
          isDeleted: false,
          status: 'PUBLISHED',
          noIndex: false,
          stockQuantity: { gt: 0 },
        },
        include,
        take: limit - selected.size,
        orderBy: [{ isBestSeller: 'desc' }, { updatedAt: 'desc' }],
      });
      for (const filler of fillers) selected.set(filler.id, filler);
    }

    return [...selected.values()].slice(0, limit).map((p) => this.presentForStorefront(p));
  }

  private normalizeProductName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  private tokenizeProductName(name: string): string[] {
    const stop = new Set([
      'and', 'the', 'for', 'with', 'from', 'new', 'used', 'set', 'per', 'kit', 'of', 'in', 'to',
      'a', 'an', 'by', 'on', 'or', 'pack', 'pcs', 'pc', 'unit', 'units', 'black', 'white',
    ]);
    return this.normalizeProductName(name)
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stop.has(w) && !/^\d+$/.test(w));
  }

  private namesTooSimilar(a: string, b: string) {
    const na = this.normalizeProductName(a);
    const nb = this.normalizeProductName(b);
    if (!na || !nb) return false;
    if (na === nb) return true;
    // Treat as duplicate if one title fully contains the other and lengths are close
    const shorter = na.length <= nb.length ? na : nb;
    const longer = na.length <= nb.length ? nb : na;
    return longer.includes(shorter) && shorter.length / longer.length > 0.85;
  }

  private scoreRelatedCandidate(source: any, candidate: any): number {
    let score = 0;
    if (source.categoryId && candidate.categoryId === source.categoryId) score += 50;
    if (source.brandId && candidate.brandId === source.brandId) score += 35;

    const sourceTokens = this.tokenizeProductName(source.name || '');
    const candidateName = (candidate.name || '').toLowerCase();
    const overlap = sourceTokens.filter((t) => candidateName.includes(t)).length;
    score += Math.min(overlap, 6) * 10;

    const sourcePrice = Number(source.sellingPrice) || 0;
    const candidatePrice = Number(candidate.sellingPrice) || 0;
    if (sourcePrice > 0 && candidatePrice > 0) {
      const rel = Math.abs(candidatePrice - sourcePrice) / sourcePrice;
      if (rel <= 0.25) score += 20;
      else if (rel <= 0.5) score += 12;
      else if (rel <= 1) score += 5;
      else score -= 8;
    }

    const inStock =
      (candidate.stockQuantity ?? 0) > 0 ||
      (candidate.stockCpt ?? 0) > 0 ||
      (candidate.stockJhb ?? 0) > 0 ||
      (candidate.stockDbn ?? 0) > 0;
    if (inStock) score += 15;
    else score -= 20;

    if (candidate.isBestSeller) score += 5;
    if (source.condition && candidate.condition === source.condition) score += 4;

    return score;
  }
}

export const productService = new ProductService();
