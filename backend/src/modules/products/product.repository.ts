import prisma from '../../lib/prisma';
import { ListProductsDto } from './product.dto';

export class ProductRepository {
  private filterExpiredDiscounts(products: any[]) {
    const now = new Date();
    return products.map((product) => {
      if (product.originalPrice && product.discountExpiresAt) {
        const expiresAt = new Date(product.discountExpiresAt);
        if (expiresAt < now) {
          // Discount has expired, remove originalPrice
          const { originalPrice, discountExpiresAt, ...rest } = product;
          return rest;
        }
      }
      return product;
    });
  }

  async findMany(filters: ListProductsDto) {
    const { search, category, condition, tag, brand, featured, minPrice, maxPrice, sort, page, limit, discount, inStock, newArrivals, status } = filters;

    const where: any = { isDeleted: false };
    if (!status || (status as string) === '' || status === 'PUBLISHED') {
      where.isActive = true;
      where.status = 'PUBLISHED';
    } else if (status === 'DRAFT') {
      where.isActive = true;
      where.status = 'DRAFT';
    }
    // status === 'all' → no isActive or status filter (admin sees everything)

    // Get brand ID if brand filter is provided
    let brandId: string | undefined;
    if (brand) {
      const brandRecord = await prisma.brand.findUnique({ where: { slug: brand } });
      brandId = brandRecord?.id;
      // If brand is specified but not found, return empty results
      if (!brandId) {
        return { products: [], total: 0, page: 1, limit: parseInt(limit || '12', 10) };
      }
    }

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
    else if (featured === 'false') where.isFeatured = false;
    if (tag) where.tags = { some: { tag: tag } };
    if (brandId) {
      where.brandId = brandId;
    }
    if (discount === 'true') {
      where.originalPrice = { not: null };
    }
    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }
    if (newArrivals === 'true') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    }
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    // Always sort in-stock products first, then apply user-chosen secondary sort.
    // stockQuantity DESC ensures products with stock > 0 float to the top.
    const secondarySort: any =
      sort === 'price_asc'  ? { sellingPrice: 'asc' } :
      sort === 'price_desc' ? { sellingPrice: 'desc' } :
      sort === 'name'       ? { name: 'asc' } :
      { createdAt: 'desc' };

    const orderBy: any[] = [
      { stockQuantity: 'desc' },  // in-stock first (0 → last)
      secondarySort,
    ];

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
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          tags: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const filteredProducts = this.filterExpiredDiscounts(products);

    return { products: filteredProducts, total, page: safePage, limit: take };
  }

  async findBySlug(slug: string) {
    const product = await (prisma as any).product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        tags: true,
        variants: true,
        specifications: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) return null;

    return this.filterExpiredDiscounts([product])[0];
  }

  async findById(id: string) {
    const product = await (prisma as any).product.findUnique({
      where: { id },
      include: { images: true, tags: true, category: true, brand: { select: { id: true, name: true, slug: true } }, specifications: { orderBy: { sortOrder: 'asc' } }, documents: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!product) return null;

    return this.filterExpiredDiscounts([product])[0];
  }

  async create(data: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    condition: 'NEW' | 'REFURBISHED';
    costPrice: number;
    sellingPrice: number;
    originalPrice?: number;
    discountExpiresAt?: Date;
    stockQuantity: number;
    lowStockThreshold: number;
    shippingDays?: number;
    supplierName?: string;
    sku?: string;
    isFeatured: boolean;
    brandId?: string;
    manualUrl?: string;
    additionalInfo?: string;
    images?: { url: string; altText?: string; sortOrder: number; isPrimary: boolean }[];
    tags?: string[];
    specifications?: { key: string; value: string; sortOrder?: number }[];
  }) {
    const { images, tags, specifications, ...productData } = data;

    return prisma.product.create({
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        tags: tags ? { create: tags.map((t) => ({ tag: t })) } : undefined,
        specifications: specifications ? { create: specifications } : undefined,
      },
      include: { images: true, tags: true, category: true, specifications: true },
    });
  }

  async update(id: string, data: Record<string, any>) {
    const { images, tags, specifications, ...productData } = data;

    // Handle images: delete existing and create new ones
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }

    // Handle tags: delete existing and create new ones  
    if (tags !== undefined) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
    }

    // Handle specifications: delete existing and create new ones
    if (specifications !== undefined) {
      await prisma.productSpecification.deleteMany({ where: { productId: id } });
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...productData,
        images: images ? { create: images } : undefined,
        tags: tags ? { create: tags.map((t: string) => ({ tag: t })) } : undefined,
        specifications: specifications ? { create: specifications } : undefined,
      },
      include: { images: true, tags: true, category: true, specifications: true },
    });
  }

  async hardDeleteByCategory(categorySlug: string) {
    const products = await prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      select: { id: true },
    });
    const ids = products.map((p) => p.id);
    if (ids.length === 0) return { deleted: 0 };
    await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    await prisma.productTag.deleteMany({ where: { productId: { in: ids } } });
    await prisma.productSpecification.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    return { deleted: ids.length };
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async hardDelete(id: string) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productTag.deleteMany({ where: { productId: id } });
    await prisma.productSpecification.deleteMany({ where: { productId: id } });
    await prisma.bundleItem.deleteMany({ where: { productId: id } });
    return prisma.product.delete({ where: { id } });
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

  async findManyForExport(filters: any = {}) {
    const { search, category, condition, brand, featured, ids } = filters;
    const where: any = {};

    if (ids) {
      // Filter by specific product IDs (comma-separated)
      const idArray = ids.split(',').map((id: string) => id.trim()).filter((id: string) => id);
      if (idArray.length > 0) {
        where.id = { in: idArray };
      }
    }

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
    if (brand) {
      const brandRecord = await prisma.brand.findUnique({ where: { slug: brand } });
      if (brandRecord) {
        where.brandId = brandRecord.id;
      }
    }

    return prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        condition: true,
        sellingPrice: true,
        costPrice: true,
        originalPrice: true,
        stockQuantity: true,
        stockCpt: true,
        stockJhb: true,
        stockDbn: true,
        lowStockThreshold: true,
        shippingDays: true,
        isFeatured: true,
        isActive: true,
        additionalInfo: true,
        createdAt: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        tags: { select: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const productRepository = new ProductRepository();
