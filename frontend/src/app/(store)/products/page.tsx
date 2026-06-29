import { Suspense } from 'react';
import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import ProductsClient from './ProductsClient';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(params: Record<string, string> = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${queryString}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], pagination: { total: 0, pages: 1 } };
    return await res.json();
  } catch {
    return { products: [], pagination: { total: 0, pages: 1 } };
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchBrands() {
  try {
    const res = await fetch(`${API_URL}/brands`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; page?: string }>;
}): Promise<Metadata> {
  const SITE_URL = 'https://bretunetech.com';
  const base = `${SITE_URL}/products`;
  const resolvedParams = await searchParams;

  const category = resolvedParams.category;
  const brand = resolvedParams.brand;
  const search = resolvedParams.search;

  let title = 'Products | Bretunetech';
  let description = 'Browse enterprise networking equipment, power solutions, computing products, and IT infrastructure from trusted brands. Free delivery on qualifying orders.';

  if (category) {
    const name = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products | Bretunetech`;
    description = `Shop ${name} products at Bretunetech. Quality technology products with fast delivery across South Africa.`;
  } else if (brand) {
    const name = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products | Bretunetech`;
    description = `Shop ${name} products at Bretunetech. Authorised supplier with nationwide delivery.`;
  } else if (search) {
    title = `Search: ${search} | Bretunetech`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: base,
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string; category?: string; brand?: string; sort?: string; discount?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = parseInt(resolvedParams.limit || '15', 10);
  
  const [productsData, categories, brands] = await Promise.all([
    fetchProducts({
      page: String(page),
      limit: String(limit),
      search: resolvedParams.search || '',
      category: resolvedParams.category || '',
      brand: resolvedParams.brand || '',
      sort: resolvedParams.sort || '',
      discount: resolvedParams.discount || '',
    }),
    fetchCategories(),
    fetchBrands(),
  ]);

  return (
    <div className="py-8 bg-white min-h-screen">
      <Container>
        {/* sr-only h1 for plain /products — filtered views render a visible h1 in ProductsClient */}
        {!resolvedParams.category && !resolvedParams.brand && (
          <h1 className="sr-only">Networking, CCTV, WiFi &amp; Technology Products in South Africa</h1>
        )}
        {/* Client Component for Interactive Features */}
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
            categories={categories}
            brands={brands}
            searchParams={resolvedParams}
          />
        </Suspense>
      </Container>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="flex gap-8">
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-9 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-6 w-24 mt-1 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
