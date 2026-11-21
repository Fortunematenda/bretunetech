import type { Prisma } from '../../../generated/prisma/client';

/**
 * Storefront-safe product projections.
 *
 * Every anonymous or customer-facing response that contains product data must
 * pass through these builders. They construct new objects from an explicit
 * allowlist, so cost prices, supplier details, vendor links, stock thresholds,
 * publication flags and SEO-scoring internals never leave the API even when a
 * query loads the full row.
 */

/** Normalised tag keys that are internal workflow or supplier markers. */
const INTERNAL_TAG_KEYS = new Set(['cataloguearchived', 'scoop', 'scooptechnologies']);

const normaliseKey = (value: unknown) =>
  String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const num = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null;

const iso = (value: unknown): string | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function publicStockStatus(product: any): StockStatus {
  const warehouses = num(product.stockCpt) + num(product.stockJhb) + num(product.stockDbn);
  const available = Math.max(num(product.stockQuantity), warehouses);
  if (available <= 0) return 'out_of_stock';
  const threshold = product.lowStockThreshold == null ? 5 : num(product.lowStockThreshold, 5);
  return available <= threshold ? 'low_stock' : 'in_stock';
}

/** Merchandising tags only — drops workflow markers and tags naming the product's supplier. */
export function publicTags(tags: unknown, supplierName?: string | null): { tag: string }[] {
  if (!Array.isArray(tags)) return [];
  const supplierKey = normaliseKey(supplierName);
  const out: { tag: string }[] = [];
  const seen = new Set<string>();
  for (const entry of tags) {
    const tag = typeof entry === 'string' ? entry : (entry as any)?.tag;
    if (typeof tag !== 'string' || !tag.trim()) continue;
    const key = normaliseKey(tag);
    if (!key || INTERNAL_TAG_KEYS.has(key) || seen.has(key)) continue;
    if (supplierKey && key.length >= 3 && (key === supplierKey || supplierKey.startsWith(key))) continue;
    seen.add(key);
    out.push({ tag: tag.trim() });
  }
  return out;
}

function publicCategory(category: any) {
  if (!category?.slug) return null;
  return {
    id: category.id ?? null,
    name: category.name,
    slug: category.slug,
    parent: category.parent?.slug
      ? { id: category.parent.id ?? null, name: category.parent.name, slug: category.parent.slug }
      : null,
  };
}

function publicBrand(brand: any) {
  if (!brand?.slug) return null;
  return { id: brand.id ?? null, name: brand.name, slug: brand.slug };
}

function publicImages(images: unknown, fallbackAlt: string, productAlt?: string | null) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((image: any) => typeof image?.url === 'string' && image.url)
    .map((image: any) => ({
      id: image.id ?? null,
      url: image.url,
      altText: str(image.altText)?.trim() || str(productAlt)?.trim() || fallbackAlt,
      isPrimary: Boolean(image.isPrimary),
      sortOrder: num(image.sortOrder),
    }));
}

/** Shape used by listings, search, related products, bundles, carts, wishlists and orders. */
export function toPublicProductSummary(product: any) {
  const displayName = str(product.displayName)?.trim() || product.name;
  return {
    id: product.id,
    slug: product.slug,
    name: displayName,
    displayName,
    description: product.description ?? '',
    shortDescription: product.shortDescription ?? product.description ?? '',
    condition: product.condition,
    sellingPrice: num(product.sellingPrice),
    originalPrice: product.originalPrice == null ? null : num(product.originalPrice),
    discountExpiresAt: iso(product.discountExpiresAt),
    stockQuantity: num(product.stockQuantity),
    stockCpt: num(product.stockCpt),
    stockJhb: num(product.stockJhb),
    stockDbn: num(product.stockDbn),
    stockStatus: publicStockStatus(product),
    sku: str(product.sku),
    isFeatured: Boolean(product.isFeatured),
    isBestSeller: Boolean(product.isBestSeller),
    averageRating: num(product.averageRating),
    reviewCount: num(product.reviewCount),
    shippingDays: product.shippingDays == null ? null : num(product.shippingDays),
    noIndex: Boolean(product.noIndex),
    createdAt: iso(product.createdAt),
    updatedAt: iso(product.updatedAt),
    category: publicCategory(product.category),
    brand: publicBrand(product.brand),
    images: publicImages(product.images, displayName, product.imageAltText),
    tags: publicTags(product.tags, product.supplierName),
  };
}

/** Product detail page shape: summary plus copy, specifications, documents and public SEO fields. */
export function toPublicProductDetail(product: any) {
  const summary = toPublicProductSummary(product);
  return {
    ...summary,
    fullDescription: product.fullDescription ?? summary.description,
    seoTitle: str(product.seoTitle),
    metaTitle: str(product.metaTitle),
    metaDescription: str(product.metaDescription),
    canonicalUrl: str(product.canonicalUrl),
    manualUrl: str(product.manualUrl),
    additionalInfo: str(product.additionalInfo),
    specifications: Array.isArray(product.specifications)
      ? product.specifications.map((spec: any) => ({
          key: spec.key,
          value: spec.value,
          sortOrder: num(spec.sortOrder),
        }))
      : [],
    documents: Array.isArray(product.documents)
      ? product.documents.map((doc: any) => ({
          id: doc.id,
          url: doc.url,
          name: doc.name,
          type: doc.type,
        }))
      : [],
  };
}

export type PublicProductSummary = ReturnType<typeof toPublicProductSummary>;
export type PublicProductDetail = ReturnType<typeof toPublicProductDetail>;

/**
 * Prisma `select` for product rows nested inside carts, wishlists, bundles and
 * orders. Loads only what the summary builder reads (plus supplierName for tag
 * filtering, which the builder never emits).
 */
export const PUBLIC_PRODUCT_NESTED_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  description: true,
  shortDescription: true,
  condition: true,
  sellingPrice: true,
  originalPrice: true,
  discountExpiresAt: true,
  stockQuantity: true,
  stockCpt: true,
  stockJhb: true,
  stockDbn: true,
  lowStockThreshold: true,
  sku: true,
  isFeatured: true,
  isBestSeller: true,
  averageRating: true,
  reviewCount: true,
  shippingDays: true,
  noIndex: true,
  imageAltText: true,
  supplierName: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  images: {
    select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
  },
  tags: { select: { tag: true } },
} satisfies Prisma.ProductSelect;

/** Prisma `select` for product rows shown on a customer's own orders. */
export const ORDER_PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  sku: true,
  sellingPrice: true,
  originalPrice: true,
  images: {
    select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
  },
} satisfies Prisma.ProductSelect;

/** Where-clause for products a shopper may see. */
export const STOREFRONT_VISIBLE_WHERE = {
  isActive: true,
  isDeleted: false,
  status: 'PUBLISHED' as const,
  NOT: { tags: { some: { tag: 'catalogue-archived' } } },
};

/**
 * Removed on purpose (deleted, archived by catalogue cleanup, or discontinued),
 * as opposed to a draft or temporarily unpublished product, which stays a 404.
 */
export function isIntentionallyRemoved(product: any): boolean {
  if (!product || isStorefrontVisible(product)) return false;
  const archived =
    Array.isArray(product.tags) && product.tags.some((t: any) => (t?.tag ?? t) === 'catalogue-archived');
  return Boolean(product.isDeleted || archived || product.discontinued);
}

export function isStorefrontVisible(product: any): boolean {
  if (!product) return false;
  const archived =
    Array.isArray(product.tags) && product.tags.some((t: any) => (t?.tag ?? t) === 'catalogue-archived');
  return Boolean(product.isActive) && !product.isDeleted && product.status === 'PUBLISHED' && !archived;
}
