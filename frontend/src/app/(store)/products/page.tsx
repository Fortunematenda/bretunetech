import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.bretunetech.com/api';

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
  searchParams: Promise<{ category?: string; brand?: string; search?: string; solution?: string; page?: string }>;
}): Promise<Metadata> {
  const SITE_URL = 'https://bretunetech.com';
  const base = `${SITE_URL}/products`;
  const resolvedParams = await searchParams;

  const category = resolvedParams.category;
  const brand = resolvedParams.brand;
  const search = resolvedParams.search;
  const solution = resolvedParams.solution;

  let title = 'Products | BretuneTech';
  let description = 'Browse enterprise networking equipment, power solutions, computing products, and IT infrastructure from trusted brands. Free delivery on qualifying orders.';

  if (solution) {
    const name = solution.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} | BretuneTech`;
    description = `Shop ${name} products at BretuneTech. Quality technology products with fast delivery across South Africa.`;
  } else if (category) {
    const name = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products | BretuneTech`;
    description = `Shop ${name} products at BretuneTech. Quality technology products with fast delivery across South Africa.`;
  } else if (brand) {
    const name = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products | BretuneTech`;
    description = `Shop ${name} products at BretuneTech. Authorised supplier with nationwide delivery.`;
  } else if (search) {
    title = `Search: ${search} | BretuneTech`;
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
  searchParams: Promise<{ page?: string; limit?: string; search?: string; category?: string; solution?: string; brand?: string; sort?: string; discount?: string; minPrice?: string; maxPrice?: string; priceMin?: string; priceMax?: string; condition?: string; bestSeller?: string; newArrivals?: string; inStock?: string }>;
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
      solution: resolvedParams.solution || '',
      brand: resolvedParams.brand || '',
      sort: resolvedParams.sort || '',
      discount: resolvedParams.discount || '',
      minPrice: resolvedParams.minPrice || resolvedParams.priceMin || '',
      maxPrice: resolvedParams.maxPrice || resolvedParams.priceMax || '',
      condition: resolvedParams.condition || '',
      bestSeller: resolvedParams.bestSeller || '',
      newArrivals: resolvedParams.newArrivals || '',
      inStock: resolvedParams.inStock || '',
    }),
    fetchCategories(),
    fetchBrands(),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
            categories={categories}
            brands={brands}
            searchParams={resolvedParams}
          />
        </Suspense>
      </div>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>
        <div className="hidden h-10 w-full max-w-xl rounded-lg bg-gray-200 lg:block" />
      </div>
      <div className="mb-6 h-11 w-full rounded-xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="aspect-[4/3] bg-gray-100" />
            <div className="space-y-2.5 p-4">
              <div className="h-3 w-16 rounded bg-gray-100" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-1 h-6 w-24 rounded bg-gray-100" />
              <div className="h-10 w-full rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
