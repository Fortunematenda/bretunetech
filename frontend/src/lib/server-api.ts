/**
 * Server-side API helpers for App Router SSR.
 *
 * Catalogue fetchers never turn an API failure into "empty" or "not found":
 * they throw UpstreamError, which renders as a 5xx so crawlers retry instead
 * of recording a soft 404 or a false 404. Only a real 404 from the API maps
 * to `null`.
 */

import { unstable_rethrow } from 'next/navigation';
import { DEFAULT_API_URL } from '@/lib/config';

export function getServerApiUrl(): string {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

export class UpstreamError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
  }
}

const API_TIMEOUT_MS = 10000;

export function buildQuery(params: Record<string, string | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const trimmed = String(value).trim();
    if (!trimmed) continue;
    qs.set(key, trimmed);
  }
  return qs.toString();
}

type FetchInit = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

async function request(path: string, init: FetchInit = {}): Promise<Response> {
  const { next, ...rest } = init;
  try {
    return await fetch(`${getServerApiUrl()}${path}`, {
      ...(next ? { next } : { cache: 'no-store' as const }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      ...rest,
    });
  } catch (err) {
    unstable_rethrow(err);
    throw new UpstreamError(`Catalogue API unreachable for ${path}: ${(err as Error).message}`);
  }
}

async function requestJson<T>(path: string, init?: FetchInit): Promise<T> {
  const res = await request(path, init);
  if (!res.ok) throw new UpstreamError(`Catalogue API returned ${res.status} for ${path}`, res.status);
  try {
    return (await res.json()) as T;
  } catch {
    throw new UpstreamError(`Catalogue API returned invalid JSON for ${path}`, res.status);
  }
}

export type ProductsListResult = {
  products: any[];
  pagination: { total: number; pages: number; page?: number; limit?: number };
};

export async function fetchProductsList(
  params: Record<string, string | undefined | null> = {},
): Promise<ProductsListResult> {
  const query = buildQuery(params);
  const data = await requestJson<any>(`/products${query ? `?${query}` : ''}`);
  if (!Array.isArray(data?.products) || typeof data?.pagination?.total !== 'number') {
    throw new UpstreamError('Catalogue API returned an unexpected product list shape');
  }
  return { products: data.products, pagination: data.pagination };
}

/**
 * Cached product count for a category landing, for deciding whether to show
 * navigation links. `null` when unknown (API error): callers keep the link.
 */
export async function fetchCategoryProductCount(slug: string, revalidate = 3600): Promise<number | null> {
  try {
    const res = await request(`/products?${buildQuery({ category: slug, limit: '1', page: '1' })}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.pagination?.total === 'number' ? data.pagination.total : null;
  } catch (err) {
    unstable_rethrow(err);
    return null;
  }
}

/** Public product by slug. `null` only when the API says 404/410 (the proxy answers 410 itself); renamed slugs follow the API's 301. */
export async function fetchProductBySlug(slug: string, revalidate = 60): Promise<any | null> {
  const res = await request(`/products/${encodeURIComponent(slug)}`, { next: { revalidate } });
  if (res.status === 404 || res.status === 410) return null;
  if (!res.ok) throw new UpstreamError(`Catalogue API returned ${res.status} for product ${slug}`, res.status);
  return res.json();
}

/** Categories that currently have visible products (tree of parents with children). */
export async function fetchCategoriesList(): Promise<any[]> {
  const data = await requestJson<unknown>('/categories');
  if (!Array.isArray(data)) throw new UpstreamError('Catalogue API returned an unexpected category list');
  return data;
}

/** Every category record, including empty ones (flat list). */
export async function fetchAllCategories(): Promise<any[]> {
  const data = await requestJson<unknown>('/categories?all=true');
  if (!Array.isArray(data)) throw new UpstreamError('Catalogue API returned an unexpected category list');
  return data;
}

export async function fetchBrandsList(): Promise<any[]> {
  const data = await requestJson<unknown>('/brands');
  if (!Array.isArray(data)) throw new UpstreamError('Catalogue API returned an unexpected brand list');
  return data;
}
