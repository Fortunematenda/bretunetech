import type { MetadataRoute } from 'next';
import { bundleCatalog } from '@/lib/bundle-catalog';
import { getAllServiceSlugs } from '@/lib/service-landings';
import {
  LEGACY_CATEGORY_REDIRECTS,
  PRIMARY_CATEGORY_SLUGS,
  SITE_URL,
  categoryPath,
  isRemovedCategorySlug,
} from '@/lib/category-seo';
import { brandPath } from '@/lib/catalogue-routing';
import { fetchBrandsList, fetchCategoriesList, fetchProductsList } from '@/lib/server-api';

/**
 * Only canonical, indexable URLs that currently answer 200 with content.
 * Catalogue fetch failures throw (sitemap → 5xx) rather than publishing a
 * sitemap that silently drops every product or category.
 */

const SITEMAP_PRODUCT_LIMIT = '5000';

async function indexableProducts() {
  const { products } = await fetchProductsList({ limit: SITEMAP_PRODUCT_LIMIT, page: '1' });
  return products
    .filter((p: any) => typeof p?.slug === 'string' && p.slug && !p.noIndex)
    .map((p: any) => ({ slug: p.slug as string, lastModified: (p.updatedAt || p.createdAt || undefined) as string | undefined }));
}

async function indexableCategorySlugs(): Promise<string[]> {
  const tree = await fetchCategoriesList();
  const slugs = new Set<string>();
  for (const parent of tree) {
    if (parent?.slug && (parent._count?.products ?? 0) > 0) slugs.add(String(parent.slug).toLowerCase());
    for (const child of parent?.children || []) {
      if (child?.slug && (child._count?.products ?? 0) > 0) slugs.add(String(child.slug).toLowerCase());
    }
  }

  // Configured landings (alias groups) are listed only while they have products.
  const landings = PRIMARY_CATEGORY_SLUGS.filter((s) => !LEGACY_CATEGORY_REDIRECTS[s] && !slugs.has(s));
  const counts = await Promise.all(
    landings.map(async (slug) => {
      const { pagination } = await fetchProductsList({ category: slug, limit: '1', page: '1' });
      return [slug, pagination.total] as const;
    }),
  );
  for (const [slug, total] of counts) if (total > 0) slugs.add(slug);

  for (const slug of [...slugs]) {
    if (isRemovedCategorySlug(slug) || LEGACY_CATEGORY_REDIRECTS[slug]) slugs.delete(slug);
  }
  return [...slugs].sort();
}

async function indexableBrandSlugs(): Promise<string[]> {
  const brands = await fetchBrandsList();
  return brands
    .filter((b: any) => b?.slug && (b.publicProductCount ?? 0) > 0)
    .map((b: any) => String(b.slug));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categorySlugs, brandSlugs] = await Promise.all([
    indexableProducts(),
    indexableCategorySlugs(),
    indexableBrandSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/bundles`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/brands`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/services/book`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/services/areas/cape-town`, changeFrequency: 'monthly', priority: 0.75 },
    ...getAllServiceSlugs().map((slug) => ({
      url: `${SITE_URL}/services/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/best-sellers`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/delivery`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/returns`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/warranty`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/trusted-suppliers`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/quote`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/company-information`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}${categoryPath(slug)}`,
    changeFrequency: 'weekly' as const,
    priority: (PRIMARY_CATEGORY_SLUGS as readonly string[]).includes(slug) ? 0.85 : 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    ...(p.lastModified ? { lastModified: p.lastModified } : {}),
  }));

  const bundlePages: MetadataRoute.Sitemap = Object.keys(bundleCatalog).map((slug) => ({
    url: `${SITE_URL}/bundles/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }));

  const brandPages: MetadataRoute.Sitemap = brandSlugs.map((slug) => ({
    url: `${SITE_URL}${brandPath(slug)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...bundlePages, ...brandPages];
}
