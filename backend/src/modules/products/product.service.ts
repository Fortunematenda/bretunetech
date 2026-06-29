import { productRepository } from './product.repository';
import { CreateProductDto, UpdateProductDto, ListProductsDto } from './product.dto';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';
import { seoService } from '../seo/seo.service';
import { specsService } from '../specs/specs.service';
import { uploadManualFromUrl } from '../../lib/cloudinary';

const log = logger.child('ProductService');

export class ProductService {
  async listProducts(filters: ListProductsDto) {
    const { products, total, page, limit } = await productRepository.findMany(filters);

    return {
      products,
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
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const slug = generateSlug(dto.name);

    log.info('Creating product with data:', {
      specifications: dto.specifications,
      manualUrl: dto.manualUrl,
      additionalInfo: dto.additionalInfo
    });

    // Upload manual to Cloudinary if URL is provided
    let finalManualUrl = dto.manualUrl;
    if (dto.manualUrl && dto.manualUrl.startsWith('http')) {
      const cloudinaryResult = await uploadManualFromUrl(dto.manualUrl);
      if (cloudinaryResult) {
        finalManualUrl = cloudinaryResult.url;
        log.info('Manual uploaded to Cloudinary', { originalUrl: dto.manualUrl, cloudinaryUrl: finalManualUrl });
      }
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
      brandId: dto.brandId,
      images: dto.images,
      tags: dto.tags,
      specifications: dto.specifications,
      manualUrl: finalManualUrl,
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
    await this.getProductById(id); // Ensure exists

    const data: any = { ...dto };
    if (dto.name) {
      data.slug = generateSlug(dto.name);
    }
    if (dto.discountExpiresAt) {
      data.discountExpiresAt = new Date(dto.discountExpiresAt);
    }

    // Upload manual to Cloudinary if URL is provided
    if (dto.manualUrl && dto.manualUrl.startsWith('http')) {
      const cloudinaryResult = await uploadManualFromUrl(dto.manualUrl);
      if (cloudinaryResult) {
        data.manualUrl = cloudinaryResult.url;
        log.info('Manual uploaded to Cloudinary on update', { originalUrl: dto.manualUrl, cloudinaryUrl: data.manualUrl });
      }
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
}

export const productService = new ProductService();
