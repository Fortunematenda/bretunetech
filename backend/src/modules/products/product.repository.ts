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

  /**
   * Shop-by-solution / category filter aliases.
   * Live DB may still use legacy parents (technology, internet-networking, power-solutions)
   * alongside seed-categories.ts parents. Always match parent OR child slugs.
   */
  private static readonly CATEGORY_ALIASES: Record<string, string[]> = {
    networking: [
      'networking',
      'internet-networking',
      'routers',
      'mesh-wifi-systems',
      'access-points',
      'network-switches',
      'network-cables',
      'fibre-equipment',
      'network-cabinets',
      'poe-equipment',
    ],
    'cctv-security': [
      'cctv-security',
      'cctv-cameras',
      'nvrs-dvrs',
      'video-doorbells',
      'access-control',
      'alarm-systems',
      'intercom-systems',
    ],
    'power-backup': [
      'power-backup',
      'power-solutions',
      'ups-systems',
      'inverters',
      'batteries',
      'surge-protectors',
      'solar-accessories',
      'power-distribution-units',
    ],
    'computers-laptops': [
      'computers-laptops',
      'technology',
      'laptops',
      'desktop-pcs',
      'mini-pcs',
      'all-in-one-pcs',
    ],
    'wireless-solutions': [
      'wireless-solutions',
      'outdoor-wireless',
      'point-to-point-links',
      'wifi-extenders',
      'wireless-bridges',
      'antennas',
    ],
    'printers-office': [
      'printers-office',
      'printers',
      'scanners',
      'ink',
      'toners',
      'label-printers',
      'office-equipment',
    ],
  };

  /** Resolve a category/solution slug to all matching category slugs (self + aliases). */
  private resolveCategorySlugs(slug: string): string[] {
    const key = slug.trim().toLowerCase();
    if (!key) return [];
    const aliases = ProductRepository.CATEGORY_ALIASES[key];
    if (aliases?.length) return aliases;
    return [key];
  }

  private buildCategorySlugConditions(slug: string) {
    const slugs = this.resolveCategorySlugs(slug);
    if (!slugs.length) return null;
    return {
      OR: slugs.flatMap((s) => [
        { category: { slug: s } },
        { category: { parent: { slug: s } } },
      ]),
    };
  }

  private buildSolutionConditions(solution: string) {
    // Solutions are category groups — never loose name keyword search
    // (that was matching RJ45 plugs under "Computers & Laptops").
    return this.buildCategorySlugConditions(solution);
  }

  /**
   * Intent expansions so short prefixes like "comp" surface computers/laptops,
   * not only accidental name hits like "Compact".
   */
  private static readonly SEARCH_SYNONYMS: Record<string, string[]> = {
    comp: ['computer', 'computers', 'laptop', 'laptops', 'notebook', 'desktop', 'desktops', 'mini pc', 'tower'],
    computer: ['computers', 'laptop', 'laptops', 'notebook', 'desktop', 'desktops', 'mini pc', 'tower'],
    computers: ['computer', 'laptop', 'laptops', 'notebook', 'desktop', 'desktops', 'mini pc', 'tower'],
    computing: ['computer', 'laptop', 'notebook', 'desktop', 'mini pc'],
    laptop: ['laptops', 'notebook', 'notebooks'],
    laptops: ['laptop', 'notebook', 'notebooks'],
    desktop: ['desktops', 'tower', 'pc'],
    desktops: ['desktop', 'tower', 'pc'],
  };

  /** Prefix completions that are usually noise for storefront intent. */
  private static readonly SEARCH_NOISE_WORDS = new Set([
    'compact',
    'compatible',
    'compatibility',
    'component',
    'components',
    'composite',
    'compliance',
    'complement',
  ]);

  private expandSearchTerms(term: string): string[] {
    const key = term.toLowerCase();
    const synonyms = ProductRepository.SEARCH_SYNONYMS[key] || [];
    return Array.from(new Set([term, ...synonyms])).slice(0, 12);
  }

  /** Split query into words; each word must match at least one product field (AND across words). */
  private buildSearchConditions(search: string) {
    const terms = search
      .trim()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
      .slice(0, 8);

    if (terms.length === 0) return null;

    // Short prefixes (e.g. "comp") should not match noise in descriptions
    // like "compatible" / "component" on unrelated routers.
    const includeDescription = search.trim().length >= 5;

    return terms.map((term) => {
      const variants = this.expandSearchTerms(term);
      const fieldMatchers = variants.flatMap((variant) => [
        { name: { contains: variant, mode: 'insensitive' as const } },
        { displayName: { contains: variant, mode: 'insensitive' as const } },
        ...(includeDescription
          ? [
              { description: { contains: variant, mode: 'insensitive' as const } },
              { shortDescription: { contains: variant, mode: 'insensitive' as const } },
              { fullDescription: { contains: variant, mode: 'insensitive' as const } },
            ]
          : []),
        { sku: { contains: variant, mode: 'insensitive' as const } },
        { brand: { name: { contains: variant, mode: 'insensitive' as const } } },
        { category: { name: { contains: variant, mode: 'insensitive' as const } } },
        { category: { slug: { contains: variant.replace(/\s+/g, '-'), mode: 'insensitive' as const } } },
      ]);

      return { OR: fieldMatchers };
    });
  }

  /** Higher = more relevant for storefront search ranking. */
  private scoreSearchRelevance(product: any, search: string): number {
    const terms = search
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (terms.length === 0) return 0;

    const name = String(product.displayName || product.name || '').toLowerCase();
    const nameWords = name.split(/[^a-z0-9]+/).filter(Boolean);
    const category = String(product.category?.name || '').toLowerCase();
    const categorySlug = String(product.category?.slug || '').toLowerCase();
    const brandName = String(product.brand?.name || '').toLowerCase();
    const sku = String(product.sku || '').toLowerCase();
    const haystack = `${name} ${category} ${categorySlug}`;

    let score = 0;
    for (const term of terms) {
      const variants = this.expandSearchTerms(term);
      const synonymVariants = variants.filter((v) => v !== term);

      if (category.startsWith(term) || categorySlug.startsWith(term)) score += 80;
      else if (category.includes(term) || categorySlug.includes(term)) score += 55;

      // Strongest boost for real computing devices (not accessories that say "Computer").
      const deviceTokens = ['laptop', 'laptops', 'notebook', 'notebooks', 'desktop', 'desktops', 'mini pc', 'tower'];
      const deviceHit = deviceTokens.some((v) => haystack.includes(v));
      const synonymHit = synonymVariants.some((v) => haystack.includes(v));
      if (deviceHit) score += 160;
      else if (synonymHit) score += 40;

      const matchingWords = nameWords.filter((w) => w.startsWith(term));
      // Prefer "computer" over noise prefixes like "compact" / "compatible".
      if (matchingWords.some((w) => w === 'computer' || w === 'computers' || w === 'computing')) {
        // Soft boost only — "Computer Headset" should not beat laptops/desktops.
        score += deviceHit ? 40 : 25;
      } else if (matchingWords.some((w) => ProductRepository.SEARCH_NOISE_WORDS.has(w))) {
        score += 5;
      } else if (matchingWords.length > 0) {
        score += matchingWords.some((w) => w === term) ? 50 : 35;
      }

      const nameHitIsNoise =
        matchingWords.length > 0 && matchingWords.every((w) => ProductRepository.SEARCH_NOISE_WORDS.has(w));
      if (name.startsWith(term)) score += 40;
      else if (name.includes(term)) score += nameHitIsNoise ? 8 : 25;

      if (brandName.startsWith(term)) score += 20;
      else if (brandName.includes(term)) score += 12;

      if (sku.includes(term)) score += 18;
    }

    if ((product.stockQuantity ?? 0) > 0) score += 4;
    if (product.isBestSeller) score += 2;
    return score;
  }

  async findMany(filters: ListProductsDto) {
    const { search, category, solution, condition, tag, brand, featured, bestSeller, minPrice, maxPrice, sort, page, limit, discount, inStock, newArrivals, status } = filters;

    const where: any = { isDeleted: false };
    const andConditions: any[] = [];

    // Default to only active published products for public access
    // Only admin with status='all' can see everything
    if (status !== 'all') {
      where.isActive = true;
      where.status = 'PUBLISHED';
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

    const searchConditions = search ? this.buildSearchConditions(search) : null;
    if (searchConditions) {
      andConditions.push(...searchConditions);
    }
    const solutionCondition = solution ? this.buildSolutionConditions(solution) : null;
    if (solutionCondition) {
      andConditions.push(solutionCondition);
    } else if (solution?.trim()) {
      // Unknown solution slug → empty result set (don't fall through to all products).
      andConditions.push({ name: { equals: '__no_solution_match__' } });
    }
    if (category) {
      const categoryCondition = this.buildCategorySlugConditions(category);
      if (categoryCondition) {
        andConditions.push(categoryCondition);
      }
    }
    if (discount === 'true') {
      // Active deals only: has compare-at price and not past expiry.
      const now = new Date();
      andConditions.push({
        originalPrice: { not: null },
        OR: [
          { discountExpiresAt: null },
          { discountExpiresAt: { gt: now } },
        ],
      });
    }
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }
    if (condition) where.condition = condition;
    if (featured === 'true') where.isFeatured = true;
    else if (featured === 'false') where.isFeatured = false;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (tag) where.tags = { some: { tag: tag } };
    if (brandId) {
      where.brandId = brandId;
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

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: [
          { isPrimary: 'desc' as const },
          { sortOrder: 'asc' as const },
        ],
      },
      tags: true,
    };

    // Default search sort = relevance (name/category first). Explicit sort keeps user choice.
    const useRelevanceSort = Boolean(search?.trim()) && !sort;

    if (useRelevanceSort) {
      const [candidates, total] = await Promise.all([
        prisma.product.findMany({
          where,
          // Rank within a capped candidate pool so short queries stay fast.
          take: Math.min(Math.max(safeLimit * 20, 120), 400),
          orderBy: [{ stockQuantity: 'desc' }, { createdAt: 'desc' }],
          include,
        }),
        prisma.product.count({ where }),
      ]);

      const ranked = this.filterExpiredDiscounts(candidates)
        .map((product) => ({
          product,
          score: this.scoreSearchRelevance(product, search!.trim()),
        }))
        .sort((a, b) => b.score - a.score || String(a.product.name).localeCompare(String(b.product.name)))
        .map((row) => row.product);

      return {
        products: ranked.slice(skip, skip + take),
        total,
        page: safePage,
        limit: take,
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include,
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
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
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
    isBestSeller: boolean;
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

    const exportAnd: any[] = [];
    const exportSearch = search ? this.buildSearchConditions(search) : null;
    if (exportSearch) exportAnd.push(...exportSearch);
    if (category) {
      exportAnd.push({
        OR: [
          { category: { slug: category } },
          { category: { parent: { slug: category } } },
        ],
      });
    }
    if (exportAnd.length > 0) where.AND = exportAnd;
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
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        specifications: { orderBy: { sortOrder: 'asc' } },
        tags: { select: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const productRepository = new ProductRepository();
