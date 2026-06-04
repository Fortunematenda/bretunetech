import prisma from '../../lib/prisma';
import { ListProductsDto } from './product.dto';

export class ProductRepository {
  async findMany(filters: ListProductsDto) {
    const { search, category, condition, tag, featured, minPrice, maxPrice, sort, page, limit } = filters;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { slug: category };
    if (condition) where.condition = condition;
    if (featured === 'true') where.isFeatured = true;
    if (tag) where.tags = { some: { tag: tag } };
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
    if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const parsedPage = Number.parseInt(page || '1', 10);
    const parsedLimit = Number.parseInt(limit || '12', 10);
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 12;
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          tags: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page: safePage, limit: take };
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        tags: true,
        variants: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { images: true, tags: true, category: true },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    condition: 'NEW' | 'REFURBISHED';
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
    supplierName?: string;
    sku?: string;
    isFeatured: boolean;
    manualUrl?: string;
    images?: { url: string; altText?: string; sortOrder: number; isPrimary: boolean }[];
    tags?: string[];
  }) {
    const { images, tags, ...productData } = data;

    return prisma.product.create({
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        tags: tags ? { create: tags.map((t) => ({ tag: t })) } : undefined,
      },
      include: { images: true, tags: true, category: true },
    });
  }

  async update(id: string, data: Record<string, any>) {
    const { images, tags, ...productData } = data;

    // Handle images: delete existing and create new ones
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }

    // Handle tags: delete existing and create new ones  
    if (tags !== undefined) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        tags: tags ? { create: tags.map((t: string) => ({ tag: t })) } : undefined,
      },
      include: { images: true, tags: true, category: true },
    });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateStock(id: string, quantityChange: number) {
    return prisma.product.update({
      where: { id },
      data: { stockQuantity: { increment: quantityChange } },
    });
  }

  async findLowStock(threshold?: number) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: threshold || 5 },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        sellingPrice: true,
      },
      orderBy: { stockQuantity: 'asc' },
      take: 50,
    });
  }
}

export const productRepository = new ProductRepository();
