'use client';

import { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, Monitor, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  LayoutGrid, Zap, Wifi, Cable, Package, Tag, RotateCcw, ShoppingBag, Camera,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import Container from '@/components/layout/Container';

/* ── Constants ───────────────────────────────────────── */

const ITEMS_PER_PAGE = 15;
const PAGE_SIZE_OPTIONS = [15, 30, 60, 100];


const priceRanges = [
  { label: 'Any Price', min: 0, max: 0 },
  { label: 'Under R1,000', min: 0, max: 1000 },
  { label: 'R1,000 – R5,000', min: 1000, max: 5000 },
  { label: 'R5,000 – R10,000', min: 5000, max: 10000 },
  { label: 'R10,000 – R20,000', min: 10000, max: 20000 },
  { label: 'Over R20,000', min: 20000, max: 0 },
];

const conditionOptions = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'REFURBISHED', label: 'Refurbished' },
];

const tagFilters = ['Best Value', 'Best Seller', 'Load Shedding Ready', 'Premium'];

const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name', label: 'Name A–Z' },
];


/* ── Sidebar Skeleton ────────────────────────────────── */

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-3 bg-gray-200" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-9 w-full rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Product Grid Skeleton ───────────────────────────── */

function CatalogGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <Skeleton className="aspect-square rounded-none bg-gray-200" />
          <div className="p-4 space-y-2.5">
            <Skeleton className="h-3 w-20 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-2/3 bg-gray-200" />
            <Skeleton className="h-6 w-24 mt-1 bg-gray-200" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-3 w-16 bg-gray-200" />
              <Skeleton className="h-3 w-24 bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Content ────────────────────────────────────── */

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || localStorage.getItem('productSort') || '');
  const [discountOnly, setDiscountOnly] = useState(searchParams.get('discount') === 'true');
  const [priceRange, setPriceRange] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE), 10));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const lastFilterSig = useRef<string | null>(null);

  // Update URL when page or filters change
  const updateQueryParams = useCallback((newPage: number, newSearch: string, newCategory: string, newCondition: string, newSort: string, newDiscount: boolean, newLimit: number = pageSize) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newLimit !== ITEMS_PER_PAGE) params.set('limit', String(newLimit));
    if (newSearch) params.set('search', newSearch);
    if (newCategory) params.set('category', newCategory);
    if (newCondition) params.set('condition', newCondition);
    if (newSort) params.set('sort', newSort);
    if (newDiscount) params.set('discount', 'true');
    const query = params.toString();
    router.push(query ? `?${query}` : '/products', { scroll: false });
  }, [router, pageSize]);

  // Sync URL params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setCondition(searchParams.get('condition') || '');
    const urlSort = searchParams.get('sort');
    if (urlSort) {
      setSort(urlSort);
      localStorage.setItem('productSort', urlSort);
    } else {
      setSort(localStorage.getItem('productSort') || '');
    }
    setDiscountOnly(searchParams.get('discount') === 'true');
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setPageSize(parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE), 10));
  }, [searchParams]);

  // Fetch categories once
  useEffect(() => {
    categoriesApi.list()
      .then((data) => setDbCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch products from server with all filters
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {
      limit: String(pageSize),
      page: String(page),
    };
    if (search) params.search = search;
    if (category) params.category = category;
    if (condition) params.condition = condition;
    if (sort) params.sort = sort;
    const range = priceRanges[priceRange];
    if (range.min > 0) params.minPrice = String(range.min);
    if (range.max > 0) params.maxPrice = String(range.max);
    productsApi.list(params)
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
      })
      .catch(() => { setProducts([]); })
      .finally(() => setLoading(false));
  }, [search, category, condition, sort, priceRange, page, pageSize]);

  // Reset page when filters actually change (signature compare; strict-mode safe)
  useEffect(() => {
    const sig = JSON.stringify([search, category, condition, sort, priceRange, selectedTags, discountOnly]);
    if (lastFilterSig.current === null) {
      lastFilterSig.current = sig; // first render: record, don't reset
      return;
    }
    if (lastFilterSig.current === sig) return; // no real change (e.g. strict-mode re-run)
    lastFilterSig.current = sig;
    setPage(1);
    updateQueryParams(1, search, category, condition, sort, discountOnly, pageSize);
  }, [search, category, condition, sort, priceRange, selectedTags, discountOnly, pageSize, updateQueryParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateQueryParams(newPage, search, category, condition, sort, discountOnly);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateQueryParams(1, search, category, condition, sort, discountOnly, newSize);
  };

  // Build dynamic category filters from DB
  const categoryFilters = useMemo(() => [
    { value: '', label: 'All Categories', icon: LayoutGrid },
    ...dbCategories.map((c: any) => ({ value: c.slug, label: c.name, icon: Package })),
  ], [dbCategories]);

  // For display: use server total, not local count
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = products;

  // Build returnUrl from current state so back navigation preserves page/filters
  const listReturnUrl = (() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (pageSize !== ITEMS_PER_PAGE) params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (sort) params.set('sort', sort);
    if (discountOnly) params.set('discount', 'true');
    const q = params.toString();
    return q ? `/products?${q}` : '/products';
  })();

  const activeFilterCount = [category, condition, discountOnly, priceRange > 0, selectedTags.length > 0].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setSort('');
    setDiscountOnly(false);
    setPriceRange(0);
    setSelectedTags([]);
    setPage(1);
    updateQueryParams(1, '', '', '', '', false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const categoryTitle = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'All Products';

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const filterSidebar = (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1">
          {categoryFilters.map((cat) => {
            const isActive = category === cat.value;
            const count = cat.value === '' ? totalCount : (dbCategories.find((c: any) => c.slug === cat.value)?._count?.products ?? 0);
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#003d7a]/10 text-[#003d7a] border border-[#003d7a]/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <cat.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#003d7a]' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-[#003d7a]/20 text-[#003d7a]' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h3>
        <div className="space-y-1">
          {priceRanges.map((range, i) => (
            <button
              key={i}
              onClick={() => setPriceRange(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                priceRange === i
                  ? 'bg-[#003d7a]/10 text-[#003d7a] font-medium border border-[#003d7a]/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Condition</h3>
        <div className="flex gap-2">
          {conditionOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCondition(opt.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                condition === opt.value
                  ? 'bg-[#003d7a]/10 text-[#003d7a] border-[#003d7a]/25'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tagFilters.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-[#003d7a]/10 text-[#003d7a] border-[#003d7a]/25'
                    : 'text-gray-600 hover:text-gray-900 bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Tag className="w-3 h-3 inline mr-1 -mt-0.5" />
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="py-8 bg-white min-h-screen">
      <Container>
      {/* ── Top Bar ────────────────────────────────────── */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#003d7a] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">{categoryTitle}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{categoryTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading products...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Search + Sort + Mobile filter toggle */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                localStorage.setItem('productSort', e.target.value);
              }}
              className="hidden sm:block px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors cursor-pointer"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 border rounded-lg text-sm font-medium transition-colors shrink-0 ${
                mobileFiltersOpen || activeFilterCount > 0
                  ? 'bg-[#003d7a]/10 border-[#003d7a]/30 text-[#003d7a]'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-[#003d7a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Filter Chips ────────────────────────── */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-gray-500 mr-1">Active:</span>
          {category && (
            <button onClick={() => setCategory('')} className="flex items-center gap-1 px-2.5 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs font-medium rounded-lg border border-[#003d7a]/20 hover:bg-[#003d7a]/20 transition-colors">
              {category.replace(/-/g, ' ')} <X className="w-3 h-3" />
            </button>
          )}
          {condition && (
            <button onClick={() => setCondition('')} className="flex items-center gap-1 px-2.5 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs font-medium rounded-lg border border-[#003d7a]/20 hover:bg-[#003d7a]/20 transition-colors">
              {condition} <X className="w-3 h-3" />
            </button>
          )}
          {discountOnly && (
            <button onClick={() => setDiscountOnly(false)} className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-600 text-xs font-medium rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Discounted Only <X className="w-3 h-3" />
            </button>
          )}
          {priceRange > 0 && (
            <button onClick={() => setPriceRange(0)} className="flex items-center gap-1 px-2.5 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs font-medium rounded-lg border border-[#003d7a]/20 hover:bg-[#003d7a]/20 transition-colors">
              {priceRanges[priceRange].label} <X className="w-3 h-3" />
            </button>
          )}
          {selectedTags.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-1 px-2.5 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs font-medium rounded-lg border border-[#003d7a]/20 hover:bg-[#003d7a]/20 transition-colors">
              {tag} <X className="w-3 h-3" />
            </button>
          ))}
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-[#003d7a] ml-1 transition-colors">
            Clear all
          </button>
        </div>
      )}

      {/* ── Mobile Filters Drawer ─────────────────────── */}
      {mobileFiltersOpen && (
        <div className="lg:hidden mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Mobile sort */}
          <div className="mb-5 sm:hidden">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                localStorage.setItem('productSort', e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {filterSidebar}
        </div>
      )}

      {/* ── Main Layout: Sidebar + Grid ───────────────── */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" /> Filters
            </h3>
            {loading ? <SidebarSkeleton /> : filterSidebar}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <CatalogGridSkeleton count={ITEMS_PER_PAGE} />
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {paginatedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    returnUrl={listReturnUrl}
                  />
                ))}
              </div>

              {/* ── Pagination ──────────────────────────── */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page size selector */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003d7a]"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-500">
                    Showing {totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, totalCount)} of {totalCount} entries
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={safePage <= 1}
                      title="First page"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.max(1, safePage - 1))}
                      disabled={safePage <= 1}
                      title="Previous page"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="min-w-8 h-8 px-2 rounded-lg text-xs font-medium bg-[#003d7a] text-white flex items-center justify-center">
                      {safePage}
                    </span>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
                      disabled={safePage >= totalPages}
                      title="Next page"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={safePage >= totalPages}
                      title="Last page"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── Empty State ──────────────────────────── */
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
                We couldn&apos;t find anything matching your filters. Try adjusting your search or clearing filters.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#003d7a] hover:bg-[#0055a4] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                <RotateCcw className="w-4 h-4" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      </Container>
    </div>
  );
}

/* ── Page Wrapper ─────────────────────────────────────── */

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 bg-white min-h-screen">
          <Container>
            <div className="flex gap-8">
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <SidebarSkeleton />
                </div>
              </aside>
              <div className="flex-1">
                <CatalogGridSkeleton count={12} />
              </div>
            </div>
          </Container>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
