import { productRepository } from './product.repository';
import { CreateProductDto, UpdateProductDto, ListProductsDto } from './product.dto';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';

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

    const product = await productRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      categoryId: dto.categoryId,
      condition: dto.condition,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      stockQuantity: dto.stockQuantity,
      lowStockThreshold: dto.lowStockThreshold,
      supplierName: dto.supplierName,
      sku: dto.sku,
      isFeatured: dto.isFeatured,
      images: dto.images,
      tags: dto.tags,
      specifications: dto.specifications,
      manualUrl: dto.manualUrl,
      additionalInfo: dto.additionalInfo,
    });

    log.info('Product created', { id: product.id, name: product.name });
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProductById(id); // Ensure exists

    const data: any = { ...dto };
    if (dto.name) {
      data.slug = generateSlug(dto.name);
    }

    const product = await productRepository.update(id, data);
    log.info('Product updated', { id: product.id, name: product.name });
    return product;
  }

  async deleteProduct(id: string) {
    await this.getProductById(id); // Ensure exists
    await productRepository.softDelete(id);
    log.info('Product soft-deleted', { id });
    return { message: 'Product deactivated' };
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
}

export const productService = new ProductService();
