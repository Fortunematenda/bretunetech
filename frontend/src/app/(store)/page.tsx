import HomeClient from './HomeClient';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function fetchBrands() {
  try {
    const res = await fetch(`${API_URL}/brands`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function fetchFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?featured=true&limit=8`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.sellingPrice,
      originalPrice: p.originalPrice,
      image: p.images?.[0]?.url || '/assets/placeholder.svg',
      badge: p.tags?.map((t: any) => t.tag).join(', ') || undefined,
      stock: (p.stockQuantity === 0 ? 'out' : p.stockQuantity <= p.lowStockThreshold ? 'low' : 'in') as 'in' | 'low' | 'out',
      rating: p.averageRating || 0,
      shipsToday: p.stockQuantity > 0,
      shippingDays: p.shippingDays || 3,
    }));
  } catch { return []; }
}

export default async function Home() {
  const [categories, brands, featuredProducts] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchFeaturedProducts(),
  ]);

  return (
    <HomeClient
      categories={categories}
      brands={brands}
      featuredProducts={featuredProducts}
    />
  );
}
