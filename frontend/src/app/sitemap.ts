import type { MetadataRoute } from 'next';

const SITE_URL = 'https://bretunetech.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(): Promise<{ slug: string; seoGeneratedAt?: string; createdAt?: string; noIndex?: boolean }[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=5000`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || [])
      .filter((p: any) => p.isActive && !p.isDeleted && p.status === 'PUBLISHED' && !p.noIndex)
      .map((p: any) => ({
        slug: p.slug,
        seoGeneratedAt: p.seoGeneratedAt,
        createdAt: p.createdAt,
        noIndex: p.noIndex,
      }));
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((c: any) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

async function fetchBrands(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/brands`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((b: any) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts();

  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/bundles`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/services/book`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/warranty`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/trusted-suppliers`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/quote`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/company-information`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.seoGeneratedAt || p.createdAt || now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
