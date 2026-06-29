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
  searchParams: { category?: string; brand?: string; search?: string; page?: string };
}): Promise<Metadata> {
  const SITE_URL = 'https://bretunetech.com';
  const base = `${SITE_URL}/products`;

  const category = searchParams.category;
  const brand = searchParams.brand;
  const search = searchParams.search;

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
  searchParams: { page?: string; limit?: string; search?: string; category?: string; brand?: string; sort?: string; discount?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '15', 10);
  
  const [productsData, categories, brands] = await Promise.all([
    fetchProducts({
      page: String(page),
      limit: String(limit),
      search: searchParams.search || '',
      category: searchParams.category || '',
      brand: searchParams.brand || '',
      sort: searchParams.sort || '',
      discount: searchParams.discount || '',
    }),
    fetchCategories(),
    fetchBrands(),
  ]);

  const pageTitle = searchParams.category
    ? searchParams.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Products'
    : searchParams.brand
    ? searchParams.brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Products'
    : 'Networking, CCTV, WiFi & Technology Products';

  return (
    <div className="py-8 bg-white min-h-screen">
      <Container>
        {/* Visually hidden — for SEO only, does not affect layout */}
        <h1 className="sr-only">{pageTitle}</h1>
        <p className="sr-only">
          Shop networking, CCTV, WiFi, routers, access points, network switches, cables, cabinets, power solutions and technology products from BretuneTech in South Africa.
        </p>

        {/* Client Component for Interactive Features */}
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
            categories={categories}
            brands={brands}
            searchParams={searchParams}
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
