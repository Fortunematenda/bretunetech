import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { pickProductImageUrl } from '@/lib/product-image';
import HomeClient from './HomeClient';

export const metadata: Metadata = generatePageMetadata({
  title: 'Enterprise Networking, CCTV & IT Solutions in Cape Town',
  description:
    'Shop networking, power, and computing products from BretuneTech. Wi-Fi, fibre, CCTV, and MikroTik installation services for businesses in Cape Town and across South Africa.',
  path: '',
});

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.bretunetech.com/api';

async function fetchJson(path: string, revalidate: number) {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchCategories() {
  try {
    const data = await fetchJson('/categories', 300);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchBrands() {
  try {
    const data = await fetchJson('/brands', 300);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchFeaturedProducts() {
  try {
    const data = await fetchJson('/products?featured=true&limit=16', 60);
    const mapped = (data.products || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.sellingPrice,
      originalPrice: p.originalPrice,
      image: pickProductImageUrl(p.images),
      badge: p.tags?.map((t: any) => t.tag).join(', ') || undefined,
      stock: (p.stockQuantity === 0 ? 'out' : p.stockQuantity <= (p.lowStockThreshold ?? 5) ? 'low' : 'in') as 'in' | 'low' | 'out',
      rating: p.averageRating || 0,
      shipsToday: p.stockQuantity > 0,
      shippingDays: p.shippingDays || 3,
      stockQuantity: p.stockQuantity ?? 0,
    }));
    const inStock = mapped.filter((p: any) => p.stock === 'in');
    const lowStock = mapped.filter((p: any) => p.stock === 'low');
    const outStock = mapped.filter((p: any) => p.stock === 'out');
    return [...inStock, ...lowStock, ...outStock].slice(0, 8);
  } catch {
    return [];
  }
}

async function fetchHeroSettings() {
  try {
    return await fetchJson('/hero/settings', 60);
  } catch {
    return null;
  }
}

export default async function Home() {
  const [categoriesRaw, brands, featuredProducts, heroSettings] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchFeaturedProducts(),
    fetchHeroSettings(),
  ]);

  const PRIMARY = new Set([
    'networking',
    'cctv-security',
    'wifi',
    'wireless-solutions',
    'internet-networking',
    'routers',
    'access-points',
    'network-switches',
    'cctv-cameras',
    'nvrs-dvrs',
  ]);
  const DEPRIORITIZE = new Set([
    'computers-laptops',
    'computer-components',
    'printers-office',
    'peripherals',
    'gaming',
    'mobile-smart-devices',
    'storage-memory',
    'technology',
  ]);

  const categories = (categoriesRaw as any[])
    .filter((c) => (c._count?.products ?? 0) > 0)
    .sort((a, b) => {
      const ap = PRIMARY.has(a.slug) ? 0 : DEPRIORITIZE.has(a.slug) ? 2 : 1;
      const bp = PRIMARY.has(b.slug) ? 0 : DEPRIORITIZE.has(b.slug) ? 2 : 1;
      if (ap !== bp) return ap - bp;
      return (b._count?.products ?? 0) - (a._count?.products ?? 0);
    })
    .slice(0, 12);

  // Prefer brands that appear on currently featured/active catalogue products.
  const featuredBrandHints = new Set(
    (featuredProducts as any[])
      .map((p) => String(p.badge || '').toLowerCase())
      .filter(Boolean),
  );
  const focusBrandSlugs = new Set([
    'mikrotik',
    'ubiquiti',
    'ruijie',
    'reyee',
    'hikvision',
    'tp-link',
    'cudy',
    'linkbasic',
  ]);
  const filteredBrands = (brands as any[])
    .filter((b) => focusBrandSlugs.has(String(b.slug || '').toLowerCase()) || featuredBrandHints.has(String(b.name || '').toLowerCase()))
    .slice(0, 12);
  const brandsForHome = filteredBrands.length >= 4 ? filteredBrands : (brands as any[]).slice(0, 8);

  return (
    <HomeClient
      categories={categories}
      brands={brandsForHome}
      featuredProducts={featuredProducts}
      heroSettings={heroSettings}
    />
  );
}
