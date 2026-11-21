/**
 * URL, status and canonical rules for the public catalogue.
 *
 * Pure functions only (no Next.js imports) so the same rules drive the pages,
 * the proxy, the sitemap and the regression tests.
 */

import {
  LEGACY_CATEGORY_REDIRECTS,
  SITE_URL,
  categoryPath,
  isConfiguredCategorySlug,
  isRemovedCategorySlug,
} from './category-seo';

export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 100;

/** Filters that narrow the product set. A listing with any of these is a distinct, non-indexed view. */
export const SUBSET_FILTER_KEYS = [
  'search',
  'brand',
  'condition',
  'discount',
  'minPrice',
  'maxPrice',
  'inStock',
  'newArrivals',
  'bestSeller',
  'featured',
  'filter',
  'tag',
] as const;

/** Parameters that only reorder or re-slice the same product set. */
export const PRESENTATION_KEYS = ['sort', 'limit'] as const;

export type ListingParams = Partial<Record<
  (typeof SUBSET_FILTER_KEYS)[number] | (typeof PRESENTATION_KEYS)[number] | 'page' | 'category' | 'solution' | 'priceMin' | 'priceMax',
  string | undefined
>>;

const SORTS = new Set(['price_asc', 'price_desc', 'name']);
const CONDITIONS = new Set(['NEW', 'REFURBISHED']);
const BOOLEAN_KEYS = ['discount', 'inStock', 'newArrivals', 'bestSeller', 'featured'] as const;
const FILTER_SHORTCUTS = new Set(['in-stock', 'on-special', 'new-arrivals', 'under-500', 'best-sellers']);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function first(value: unknown): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
}

export function normaliseSlug(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 100 && SLUG_RE.test(slug);
}

/** Positive integer page number; anything else (missing, 0, junk) is page 1. */
export function parsePage(raw: unknown): number {
  const v = first(raw);
  if (!v || !/^\d{1,5}$/.test(v)) return 1;
  const n = Number.parseInt(v, 10);
  return n >= 1 ? n : 1;
}

export function parsePageSize(raw: unknown): number {
  const v = first(raw);
  if (!v || !/^\d{1,4}$/.test(v)) return DEFAULT_PAGE_SIZE;
  const n = Number.parseInt(v, 10);
  if (n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(n, MAX_PAGE_SIZE);
}

/**
 * Keep only listing parameters with values the API accepts, so a malformed
 * query string from a crawler or old link never turns into an API 400 → 500.
 */
export function sanitiseListingParams(raw: Record<string, unknown>): ListingParams {
  const out: ListingParams = {};

  const search = first(raw.search);
  if (search) out.search = search.slice(0, 200);

  for (const key of ['category', 'solution', 'brand'] as const) {
    const v = first(raw[key]);
    if (v) {
      const slug = normaliseSlug(v);
      if (isValidSlug(slug)) out[key] = slug;
    }
  }

  const tag = first(raw.tag);
  if (tag) out.tag = tag.slice(0, 100);

  const sort = first(raw.sort);
  if (sort && SORTS.has(sort)) out.sort = sort;

  const condition = first(raw.condition)?.toUpperCase();
  if (condition && CONDITIONS.has(condition)) out.condition = condition;

  for (const key of BOOLEAN_KEYS) {
    if (first(raw[key]) === 'true') out[key] = 'true';
  }

  const filter = first(raw.filter);
  if (filter && FILTER_SHORTCUTS.has(filter)) out.filter = filter;

  const minPrice = first(raw.minPrice) ?? first(raw.priceMin);
  if (minPrice && /^\d+(\.\d+)?$/.test(minPrice)) out.minPrice = minPrice;
  const maxPrice = first(raw.maxPrice) ?? first(raw.priceMax);
  if (maxPrice && /^\d+(\.\d+)?$/.test(maxPrice)) out.maxPrice = maxPrice;

  const page = parsePage(raw.page);
  if (page > 1) out.page = String(page);

  const limitRaw = first(raw.limit);
  if (limitRaw) {
    const limit = parsePageSize(limitRaw);
    if (limit !== DEFAULT_PAGE_SIZE) out.limit = String(limit);
  }

  return out;
}

/** API query for a sanitised listing (expands `filter` shortcuts the API does not know). */
export function toApiQuery(params: ListingParams, overrides: Record<string, string | undefined> = {}) {
  const q: Record<string, string | undefined> = {
    page: params.page || '1',
    limit: params.limit || String(DEFAULT_PAGE_SIZE),
    search: params.search,
    category: params.category,
    brand: params.brand,
    sort: params.sort,
    condition: params.condition,
    discount: params.discount,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    inStock: params.inStock,
    newArrivals: params.newArrivals,
    bestSeller: params.bestSeller,
    featured: params.featured,
    tag: params.tag,
  };
  switch (params.filter) {
    case 'in-stock': q.inStock = 'true'; break;
    case 'on-special': q.discount = 'true'; break;
    case 'new-arrivals': q.newArrivals = 'true'; break;
    case 'under-500': q.maxPrice = '500'; break;
    case 'best-sellers': q.bestSeller = 'true'; break;
  }
  return { ...q, ...overrides };
}

export function hasSubsetFilters(params: ListingParams): boolean {
  return SUBSET_FILTER_KEYS.some((key) => Boolean(params[key]));
}

const QUERY_ORDER = [...SUBSET_FILTER_KEYS, ...PRESENTATION_KEYS, 'page'] as const;

/** Stable query string from sanitised params (category/solution never included: they live in the path). */
export function listingQuery(params: ListingParams, omit: readonly string[] = []): string {
  const qs = new URLSearchParams();
  for (const key of QUERY_ORDER) {
    if (omit.includes(key)) continue;
    const v = params[key];
    if (v) qs.set(key, v);
  }
  return qs.toString();
}

export function withQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path;
}

export type CategoryResolution =
  | { kind: 'ok'; slug: string }
  | { kind: 'redirect'; slug: string }
  | { kind: 'gone' }
  | { kind: 'missing' };

/**
 * Decide what a category slug means.
 * `existingSlugs` = every category slug in the database (empty or not).
 * Configured landings (e.g. networking, wifi) are valid by definition.
 */
export function resolveCategory(raw: string, existingSlugs: ReadonlySet<string>): CategoryResolution {
  const key = normaliseSlug(raw);
  if (!isValidSlug(key)) return { kind: 'missing' };
  if (isRemovedCategorySlug(key)) return { kind: 'gone' };
  const legacy = LEGACY_CATEGORY_REDIRECTS[key];
  if (legacy) return { kind: 'redirect', slug: legacy };
  if (existingSlugs.has(key) || isConfiguredCategorySlug(key)) {
    return key === raw ? { kind: 'ok', slug: key } : { kind: 'redirect', slug: key };
  }
  return { kind: 'missing' };
}

export type ListingRobots = { index: boolean; follow: boolean };

/**
 * Canonical + robots for a catalogue listing.
 * - Unfiltered page N: self-canonical (page kept), indexable when it has products.
 * - Sort/limit only: canonical to the same unsorted page (same product set).
 * - Subset filters (search, brand, price…): noindex, self-canonical.
 * - No products at all: noindex (intentional empty state, never a soft 404).
 */
export function listingSeo(basePath: string, params: ListingParams, total: number) {
  const page = parsePage(params.page);
  const pageQuery = page > 1 ? `page=${page}` : '';
  if (hasSubsetFilters(params)) {
    return {
      canonical: `${SITE_URL}${withQuery(basePath, listingQuery(params, ['limit']))}`,
      robots: { index: false, follow: true } as ListingRobots,
    };
  }
  return {
    canonical: `${SITE_URL}${withQuery(basePath, pageQuery)}`,
    robots: { index: total > 0, follow: true } as ListingRobots,
  };
}

/** Page past the last page of a non-empty listing, or page>1 of an empty one. */
export function isPageOutOfRange(page: number, total: number, pageSize: number): boolean {
  if (page <= 1) return false;
  const pages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
  return page > pages;
}

/** Preferred URL for a category listing, preserving every meaningful filter. */
export function categoryListingUrl(slug: string, params: ListingParams): string {
  return withQuery(categoryPath(slug), listingQuery(params));
}

export function brandPath(slug: string): string {
  return `/brands/${encodeURIComponent(slug)}`;
}
