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
  const [categories, brands, featuredProducts, heroSettings] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchFeaturedProducts(),
    fetchHeroSettings(),
  ]);

  return (
    <HomeClient
      categories={categories}
      brands={brands}
      featuredProducts={featuredProducts}
      heroSettings={heroSettings}
    />
  );
}
