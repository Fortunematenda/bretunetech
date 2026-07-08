import { Suspense } from 'react';
import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import BestSellersClient from './BestSellersClient';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchBestSellers(params: Record<string, string> = {}) {
  try {
    const queryString = new URLSearchParams({ ...params, tag: 'Best Seller' }).toString();
    const res = await fetch(`${API_URL}/products?${queryString}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], pagination: { total: 0, pages: 1 } };
    return await res.json();
  } catch {
    return { products: [], pagination: { total: 0, pages: 1 } };
  }
}

export const metadata: Metadata = {
  title: 'Best Sellers | Bretunetech',
  description: 'Shop our best selling products at Bretunetech. Top-rated networking, power, and computing products loved by South African businesses.',
  alternates: {
    canonical: 'https://bretunetech.com/best-sellers',
  },
};

export default async function BestSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = parseInt(resolvedParams.limit || '24', 10);

  const productsData = await fetchBestSellers({
    page: String(page),
    limit: String(limit),
    sort: resolvedParams.sort || '',
  });

  return (
    <div className="py-8 bg-white min-h-screen">
      <Container>
        <Suspense fallback={<BestSellersSkeleton />}>
          <BestSellersClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
          />
        </Suspense>
      </Container>
    </div>
  );
}

function BestSellersSkeleton() {
  return (
    <div>
      <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-56 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2.5">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-6 w-24 mt-1 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
