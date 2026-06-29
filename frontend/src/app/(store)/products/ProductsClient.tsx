'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  LayoutGrid, Zap, Package, Tag, RotateCcw, ShoppingBag, Camera, ShoppingCart, Loader2,
  List, ChevronDown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

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

interface ProductsClientProps {
  initialProducts: any[];
  initialPagination: { total: number; pages: number };
  categories: any[];
  brands: any[];
  searchParams: { page?: string; limit?: string; search?: string; category?: string; brand?: string; sort?: string; discount?: string };
}

export default function ProductsClient({
  initialProducts,
  initialPagination,
  categories,
  brands,
  searchParams: initialSearchParams,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [hasInitialData, setHasInitialData] = useState(initialProducts.length > 0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !searchParams.get('sort')) {
      const savedSort = localStorage.getItem('productSort');
      if (savedSort) {
        setSort(savedSort);
      }
    }
  }, []);

  const [discountOnly, setDiscountOnly] = useState(searchParams.get('discount') === 'true');
  const filterSlug = searchParams.get('filter') || '';
  const inStockOnly = filterSlug === 'in-stock';
  const newArrivalsOnly = filterSlug === 'new-arrivals';
  const underR500 = filterSlug === 'under-500';
  const onSpecial = filterSlug === 'on-special' || searchParams.get('discount') === 'true';
  const bestSellers = filterSlug === 'best-sellers';
  const [priceRange, setPriceRange] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE), 10));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileViewGrid, setMobileViewGrid] = useState(true);
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [totalCount, setTotalCount] = useState(initialPagination.total);
  const [totalPages, setTotalPages] = useState(initialPagination.pages);
  const lastFilterSig = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  const updateQueryParams = useCallback((newPage: number, newSearch: string, newCategory: string, newCondition: string, newBrand: string, newSort: string, newDiscount: boolean, newFilter: string = '', newLimit: number = pageSize) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newLimit !== ITEMS_PER_PAGE) params.set('limit', String(newLimit));
    if (newSearch) params.set('search', newSearch);
    if (newCategory) params.set('category', newCategory);
    if (newCondition) params.set('condition', newCondition);
    if (newBrand) params.set('brand', newBrand);
    if (newSort) params.set('sort', newSort);
    if (newDiscount) params.set('discount', 'true');
    if (newFilter) params.set('filter', newFilter);
    const query = params.toString();
    router.push(query ? `?${query}` : '/products', { scroll: false });
  }, [router, pageSize]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setCondition(searchParams.get('condition') || '');
    setBrand(searchParams.get('brand') || '');
    const urlSort = searchParams.get('sort');
    if (urlSort) {
      setSort(urlSort);
      if (typeof window !== 'undefined') {
        localStorage.setItem('productSort', urlSort);
      }
    } else {
      if (typeof window !== 'undefined') {
        setSort(localStorage.getItem('productSort') || '');
      }
    }
    setDiscountOnly(searchParams.get('discount') === 'true');
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setPageSize(parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE), 10));
  }, [searchParams]);

  useEffect(() => {
    // Skip initial fetch if we have server-rendered data
    if (isInitialMount.current && hasInitialData) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    setLoading(true);
    const params: Record<string, string> = {
      limit: String(pageSize),
      page: String(page),
    };
    if (search) params.search = search;
    if (category) params.category = category;
    if (condition) params.condition = condition;
    if (brand) params.brand = brand;
    if (sort) params.sort = sort;
    if (discountOnly || onSpecial) params.discount = 'true';
    if (inStockOnly) params.inStock = 'true';
    if (newArrivalsOnly) params.newArrivals = 'true';
    if (bestSellers) params.featured = 'true';
    const range = priceRanges[priceRange];
    if (range.min > 0) params.minPrice = String(range.min);
    if (range.max > 0) params.maxPrice = String(range.max);
    if (underR500) params.maxPrice = '500';
    productsApi.list(params)
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
      })
      .catch(() => { setProducts([]); })
      .finally(() => setLoading(false));
  }, [search, category, condition, brand, sort, priceRange, page, pageSize, discountOnly, filterSlug, hasInitialData]);

  useEffect(() => {
    const sig = JSON.stringify([search, category, condition, brand, sort, priceRange, selectedTags, discountOnly, filterSlug]);
    if (lastFilterSig.current === null) {
      lastFilterSig.current = sig;
      return;
    }
    if (lastFilterSig.current === sig) return;
    lastFilterSig.current = sig;
    setPage(1);
    updateQueryParams(1, search, category, condition, brand, sort, discountOnly, filterSlug, pageSize);
  }, [search, category, condition, brand, sort, priceRange, selectedTags, discountOnly, pageSize, updateQueryParams, filterSlug]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateQueryParams(newPage, search, category, condition, brand, sort, discountOnly, filterSlug);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateQueryParams(1, search, category, condition, brand, sort, discountOnly, filterSlug, newSize);
  };

  const categoryFilters = useMemo(() => [
    { value: '', label: 'All Categories', icon: LayoutGrid, id: 'all' },
    ...categories.map((c: any) => ({ value: c.slug, label: c.name, icon: Package, id: c.id })),
  ], [categories]);

  const safePage = Math.min(page, totalPages);
  const paginatedProducts = products;

  const listReturnUrl = (() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (pageSize !== ITEMS_PER_PAGE) params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (brand) params.set('brand', brand);
    if (sort) params.set('sort', sort);
    if (discountOnly) params.set('discount', 'true');
    const q = params.toString();
    return q ? `/products?${q}` : '/products';
  })();

  const activeFilterCount = [category, condition, brand, discountOnly, priceRange > 0, selectedTags.length > 0].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setBrand('');
    setSort('');
    setDiscountOnly(false);
    setPriceRange(0);
    setSelectedTags([]);
    setPage(1);
    updateQueryParams(1, '', '', '', '', '', false, '');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const shopByLabels: Record<string, { label: string; icon: string }> = {
    'in-stock':     { label: 'In Stock',     icon: '✓'  },
    'on-special':   { label: 'On Special',   icon: '🏷️' },
    'new-arrivals': { label: 'New Arrivals', icon: '✨' },
    'under-500':    { label: 'Under R500',   icon: '💰' },
    'best-sellers': { label: 'Best Sellers', icon: '⭐' },
  };

  const categoryTitle = filterSlug && shopByLabels[filterSlug]
    ? shopByLabels[filterSlug].label
    : category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'All Products';

  const filterSidebar = (
    <div className="space-y-7">
      {filterSlug && shopByLabels[filterSlug] && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shop By</h3>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#003d7a]/10 border border-[#003d7a]/25 text-[#003d7a] text-sm font-medium">
            <span>{shopByLabels[filterSlug].icon}</span>
            <span className="flex-1">{shopByLabels[filterSlug].label}</span>
            <button
              onClick={() => router.push('/products')}
              className="hover:text-red-500 transition-colors"
              title="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1">
          {categoryFilters.map((cat) => {
            const isActive = category === cat.value;
            const count = cat.value === '' ? totalCount : (categories.find((c: any) => c.slug === cat.value)?._count?.products ?? 0);
            return (
              <button
                key={cat.id}
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

      {brands.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Brand</h3>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]"
          >
            <option value="">All Brands</option>
            {brands.map((b: any) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h3>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]"
        >
          {priceRanges.map((range, i) => (
            <option key={i} value={i}>{range.label}</option>
          ))}
        </select>
      </div>

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

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Discount</h3>
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#003d7a] focus:ring-[#003d7a]"
          />
          <span className="text-sm text-gray-700">Discounted Only</span>
        </label>
      </div>

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
    <>
      {/* ══════════════════════════════════════
          MOBILE-ONLY STICKY TOP CONTROLS
          Outside the flex row so it doesn't disrupt layout
         ══════════════════════════════════════ */}
      <div className="sm:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm mb-3">
        {/* Title + Filter row */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <div>
            <h1 className="text-base font-bold text-gray-900">{categoryTitle}</h1>
            <p className="text-[11px] text-gray-400">{loading ? 'Loading...' : `${totalCount.toLocaleString()} products`}</p>
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              activeFilterCount > 0 ? 'bg-[#003d7a] text-white border-[#003d7a]' : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-b border-gray-100 scrollbar-hide">
          <button
            onClick={() => setCategory('')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
              category === '' ? 'bg-[#003d7a] text-white border-[#003d7a]' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            All
          </button>
          {categories.slice(0, 12).map((cat: any) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap ${
                category === cat.slug ? 'bg-[#003d7a] text-white border-[#003d7a]' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort + View toggle */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="relative inline-flex items-center gap-1">
            <span className="text-[11px] text-gray-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('productSort', e.target.value); }}
              className="text-[11px] font-semibold text-gray-800 bg-transparent border-0 focus:outline-none pr-4 cursor-pointer appearance-none"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label || 'Newest'}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 -ml-3 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileViewGrid(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                mobileViewGrid ? 'bg-[#003d7a] text-white' : 'text-gray-400 bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileViewGrid(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                !mobileViewGrid ? 'bg-[#003d7a] text-white' : 'text-gray-400 bg-gray-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" /> Filters
          </h3>
          {loading ? <div className="space-y-6">{[1, 2, 3].map((i) => <div key={i} className="h-4 w-24 bg-gray-200 rounded mb-3" />)}</div> : filterSidebar}
        </div>
      </aside>

      {/* Product Grid Area */}
      <div className="flex-1 min-w-0">
        {/* Top Bar — desktop only */}
        <div className="mb-4 hidden sm:block">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-[#003d7a] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600">{categoryTitle}</span>
          </div>

          {/* Category heading — only when filtered */}
          {(category || brand || filterSlug) && (
            <h1 className="text-lg font-bold text-gray-900 mb-1">{categoryTitle}</h1>
          )}

          {/* Search + Sort + Filter — single row on all screen sizes */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                if (typeof window !== 'undefined') localStorage.setItem('productSort', e.target.value);
              }}
              className="shrink-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors cursor-pointer max-w-[120px] sm:max-w-none"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                mobileFiltersOpen || activeFilterCount > 0
                  ? 'bg-[#003d7a]/10 border-[#003d7a]/30 text-[#003d7a]'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-[#003d7a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-400 mt-2">
            {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Active Filter Chips */}
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

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-[500] flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#003d7a]" /> Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 w-5 h-5 bg-[#003d7a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4 border-b border-gray-100 shrink-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</p>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('productSort', e.target.value); }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]"
                >
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {loading ? <div className="space-y-6">{[1, 2, 3].map((i) => <div key={i} className="h-4 w-24 bg-gray-200 rounded mb-3" />)}</div> : filterSidebar}
              </div>
              <div className="px-5 py-4 border-t border-gray-200 shrink-0">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 bg-[#003d7a] hover:bg-blue-900 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Show Results
                </button>
                {activeFilterCount > 0 && (
                  <button onClick={() => { clearFilters(); setMobileFiltersOpen(false); }} className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-[#003d7a] transition-colors">
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-square rounded-none bg-gray-200" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-3 w-20 bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200" />
                  <Skeleton className="h-6 w-24 mt-1 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            {/* Mobile list view */}
            {!mobileViewGrid && (
              <div className="sm:hidden flex flex-col gap-2.5">
                {paginatedProducts.map((product) => {
                  const img = product.images?.[0]?.url || '/assets/placeholder.svg';
                  const disc = product.originalPrice && product.originalPrice > product.sellingPrice
                    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : null;
                  const inSt = (product.stockQuantity ?? 0) > 0 || (product.stockCpt ?? 0) > 0 || (product.stockJhb ?? 0) > 0 || (product.stockDbn ?? 0) > 0;
                  return (
                    <Link key={product.id} href={`/products/${product.slug}?returnUrl=${encodeURIComponent(listReturnUrl)}`}
                      className="flex gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 active:scale-[0.99] transition-transform">
                      <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={img} alt={product.name} className="w-full h-full object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }} />
                        {disc && <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded">-{disc}%</span>}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{product.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            inSt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>{inSt ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#003d7a]">{formatPrice(product.sellingPrice)}</p>
                            {product.originalPrice && <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>}
                          </div>
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            {/* Grid view (default on mobile, always on desktop) */}
            <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 ${
              !mobileViewGrid ? 'hidden sm:grid' : ''
            }`}>
              {paginatedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  returnUrl={listReturnUrl}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>{/* end flex gap-8 */}
    </>
  );
}

function MobileCartBar() {
  const itemCount = useCartStore((s) => s.itemCount());
  const total = useCartStore((s) => s.total());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || itemCount === 0) return null;
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[400] p-3 bg-white border-t border-gray-200 shadow-2xl">
      <Link
        href="/cart"
        className="flex items-center justify-between w-full px-5 py-3.5 bg-[#003d7a] hover:bg-blue-900 text-white rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          </div>
          <span className="text-sm font-semibold">View Cart</span>
        </div>
        <span className="text-sm font-bold">{formatPrice(total)}</span>
      </Link>
    </div>
  );
}
