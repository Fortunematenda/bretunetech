'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShoppingBag } from 'lucide-react';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

const ITEMS_PER_PAGE = 24;

interface BestSellersClientProps {
  initialProducts: any[];
  initialPagination: { total: number; pages: number };
}

export default function BestSellersClient({ initialProducts, initialPagination }: BestSellersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [totalCount, setTotalCount] = useState(initialPagination.total);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const sortOptions = [
    { value: '', label: 'Most Popular' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A–Z' },
    { value: 'newest', label: 'Newest First' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          tag: 'Best Seller',
          page: String(page),
          limit: String(ITEMS_PER_PAGE),
        };
        if (sort) params.sort = sort;

        const data = await productsApi.list(params);
        setProducts(data.products || []);
        setTotalCount(data.pagination?.total || (data as any).total || 0);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch on page/sort change (skip initial)
    if (page !== parseInt(searchParams.get('page') || '1', 10) || sort !== (searchParams.get('sort') || '')) {
      fetchProducts();
    }
  }, [page, sort]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    router.push(`/best-sellers${qs ? `?${qs}` : ''}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    const params = new URLSearchParams();
    if (newSort) params.set('sort', newSort);
    const qs = params.toString();
    router.push(`/best-sellers${qs ? `?${qs}` : ''}`);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <Link href="/" className="hover:text-[#003d7a] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Best Sellers</span>
      </div>

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Best Sellers</h1>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors cursor-pointer"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <Skeleton className="aspect-square rounded-none bg-gray-200" />
              <div className="p-4 space-y-2.5">
                <Skeleton className="h-3 w-20 bg-gray-200" />
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-6 w-24 mt-1 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-9 h-9 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No best sellers found</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
            Check back soon for our top selling products.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#003d7a] hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors">
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-[#003d7a] text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
