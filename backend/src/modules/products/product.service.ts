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
    const fullDescription = product.fullDescription?.trim() || product.description;
    const shortDescription = product.shortDescription?.trim() || fullDescription;
    return {
      ...product,
      name: displayName,
      description: fullDescription,
      displayName,
      shortDescription,
      fullDescription,
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
}

export const productService = new ProductService();
