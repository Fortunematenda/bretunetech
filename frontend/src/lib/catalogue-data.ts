import { cache } from 'react';
import {
  fetchAllCategories,
  fetchBrandsList,
  fetchCategoriesList,
  fetchCategoryProductCount,
  fetchProductBySlug,
  fetchProductsList,
} from './server-api';
import type { CategoryRecord } from './category-seo';

/** Request-scoped loaders so generateMetadata and the page share one API call each. */
export const getAllCategories = cache(fetchAllCategories);
export const getVisibleCategories = cache(fetchCategoriesList);
export const getBrands = cache(fetchBrandsList);
export const getProduct = cache((slug: string) => fetchProductBySlug(slug));

const listingByKey = cache((key: string) => fetchProductsList(JSON.parse(key)));
export function getProductsList(query: Record<string, string | undefined>) {
  const clean: Record<string, string> = {};
  for (const key of Object.keys(query).sort()) {
    const v = query[key];
    if (v) clean[key] = v;
  }
  return listingByKey(JSON.stringify(clean));
}

/** Drop links to category listings that currently have no products. */
export async function withLiveCategoryLinks<T extends { href: string }>(links: T[]): Promise<T[]> {
  const counts = await Promise.all(
    links.map((link) => {
      const slug = /^\/products\/category\/([^/?#]+)/.exec(link.href)?.[1];
      return slug ? fetchCategoryProductCount(decodeURIComponent(slug)) : Promise.resolve(null);
    }),
  );
  return links.filter((_, i) => counts[i] !== 0);
}

export function categoryIndex(all: any[]): Map<string, CategoryRecord> {
  const map = new Map<string, CategoryRecord>();
  for (const c of all) {
    if (typeof c?.slug === 'string' && c.slug) map.set(c.slug.toLowerCase(), c);
  }
  return map;
}
