import type { MetadataRoute } from 'next';
import { bundleCatalog } from '@/lib/bundle-catalog';
import { getAllServiceSlugs } from '@/lib/service-landings';
import { PRIMARY_CATEGORY_SLUGS, SITE_URL, categoryPath } from '@/lib/category-seo';
import { getServerApiUrl } from '@/lib/server-api';

const API_URL = getServerApiUrl();

async function fetchProducts(): Promise<{ slug: string; updatedAt?: string; createdAt?: string }[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=5000`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || [])
      .filter((p: any) => {
        const archived =
          Array.isArray(p.tags) && p.tags.some((t: any) => (t.tag || t) === 'catalogue-archived');
        return (
          p.isActive &&
          !p.isDeleted &&
          p.status === 'PUBLISHED' &&
          !p.noIndex &&
          !archived &&
          Boolean(p.slug)
        );
      })
      .map((p: any) => ({
        slug: p.slug,
        // Prefer real timestamps only — never invent dates.
        updatedAt: p.updatedAt || p.seoGeneratedAt || undefined,
        createdAt: p.createdAt || undefined,
      }));
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<{ slug: string; count: number }[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : [])
      .map((c: any) => ({
        slug: c.slug as string,
        count: Number(c._count?.products ?? 0),
      }))
      .filter((c: { slug: string; count: number }) => Boolean(c.slug) && c.count > 0);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);

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

  // Always include primary SEO category landings (aliases resolve server-side).
  const categorySlugs = new Set<string>([
    ...PRIMARY_CATEGORY_SLUGS.filter((s) => s !== 'internet-networking'),
    ...categories.map((c) => c.slug),
  ]);
  // Prefer clean canonicals; map legacy internet-networking → networking landing.
  categorySlugs.delete('internet-networking');

  const categoryPages: MetadataRoute.Sitemap = [...categorySlugs].map((slug) => ({
    url: `${SITE_URL}${categoryPath(slug)}`,
    changeFrequency: 'weekly' as const,
    priority: PRIMARY_CATEGORY_SLUGS.includes(slug as any) ? 0.85 : 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${SITE_URL}/products/${p.slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    };
    const last = p.updatedAt || p.createdAt;
    if (last) entry.lastModified = last;
    return entry;
  });

  const bundlePages: MetadataRoute.Sitemap = Object.keys(bundleCatalog).map((slug) => ({
    url: `${SITE_URL}/bundles/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...bundlePages];
}
