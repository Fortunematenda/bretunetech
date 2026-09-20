/**
 * Server-side API helpers for App Router SSR.
 * Always omit empty query params — Zod enums reject "" and return 400,
 * which previously caused product listings to SSR as "0 products found".
 */

import { DEFAULT_API_URL } from '@/lib/config';

export function getServerApiUrl(): string {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

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

export async function fetchProductsList(
  params: Record<string, string | undefined | null> = {},
  init?: RequestInit,
): Promise<{ products: any[]; pagination: { total: number; pages: number; page?: number; limit?: number } }> {
  const empty = { products: [], pagination: { total: 0, pages: 1 } };
  try {
    const query = buildQuery(params);
    const res = await fetch(`${getServerApiUrl()}/products${query ? `?${query}` : ''}`, {
      cache: 'no-store',
      ...init,
    });
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      products: Array.isArray(data.products) ? data.products : [],
      pagination: data.pagination || { total: 0, pages: 1 },
    };
  } catch {
    return empty;
  }
}

export async function fetchProductBySlug(slug: string, revalidate = 60): Promise<any | null> {
  try {
    const res = await fetch(`${getServerApiUrl()}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCategoriesList(): Promise<any[]> {
  try {
    const res = await fetch(`${getServerApiUrl()}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchBrandsList(): Promise<any[]> {
  try {
    const res = await fetch(`${getServerApiUrl()}/brands`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
