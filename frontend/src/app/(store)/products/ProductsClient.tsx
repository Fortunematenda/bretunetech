'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal, X, ChevronLeft, ChevronRight,
  LayoutGrid, Package, Tag, RotateCcw, ShoppingBag, Truck, ShieldCheck,
  CreditCard, Headset, List, ChevronDown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { getSolutionLabel } from '@/lib/solutions';
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

const trustSignals = [
  { icon: Truck, title: 'Fast Delivery', subtitle: '3-5 work days' },
  { icon: ShieldCheck, title: 'Quality Guaranteed', subtitle: 'Local warranty' },
  { icon: CreditCard, title: 'Secure Payments', subtitle: 'Safe & trusted' },
  { icon: Headset, title: 'Expert Support', subtitle: "We're here to help" },
];

interface ProductsClientProps {
  initialProducts: any[];
  initialPagination: { total: number; pages: number };
  categories: any[];
  brands: any[];
  searchParams: { page?: string; limit?: string; search?: string; category?: string; solution?: string; brand?: string; sort?: string; discount?: string; minPrice?: string; maxPrice?: string; priceMin?: string; priceMax?: string; condition?: string; bestSeller?: string; newArrivals?: string; inStock?: string };
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => pages.add(n));
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
    out.push(sorted[i]);
  }
  return out;
}

export default function ProductsClient({
  initialProducts,
  initialPagination,
  categories,
  brands,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [solution, setSolution] = useState(searchParams.get('solution') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [hasInitialData] = useState(initialProducts.length > 0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !searchParams.get('sort')) {
      const savedSort = localStorage.getItem('productSort');
      const validSorts = ['', 'price_asc', 'price_desc', 'name'];
      if (savedSort && validSorts.includes(savedSort)) {
        setSort(savedSort);
      } else if (savedSort && !validSorts.includes(savedSort)) {
        localStorage.removeItem('productSort');
      }
    }
  }, []);

  const [discountOnly, setDiscountOnly] = useState(searchParams.get('discount') === 'true');
  const filterSlug = searchParams.get('filter') || '';
  const inStockOnly = filterSlug === 'in-stock' || searchParams.get('inStock') === 'true';
  const newArrivalsOnly = filterSlug === 'new-arrivals' || searchParams.get('newArrivals') === 'true';
  const underR500 = filterSlug === 'under-500';
  const onSpecial = filterSlug === 'on-special' || searchParams.get('discount') === 'true';
  const bestSellers = filterSlug === 'best-sellers' || searchParams.get('bestSeller') === 'true';
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

  const updateQueryParams = useCallback((newPage: number, newSearch: string, newCategory: string, newCondition: string, newBrand: string, newSort: string, newDiscount: boolean, newFilter: string = '', newLimit: number = pageSize, newSolution: string = solution) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newLimit !== ITEMS_PER_PAGE) params.set('limit', String(newLimit));
    if (newSearch) params.set('search', newSearch);
    if (newCategory) params.set('category', newCategory);
    if (newSolution) params.set('solution', newSolution);
    if (newCondition) params.set('condition', newCondition);
    if (newBrand) params.set('brand', newBrand);
    if (newSort) params.set('sort', newSort);
    if (newDiscount) params.set('discount', 'true');
    if (newFilter) params.set('filter', newFilter);
    if (bestSellers) params.set('bestSeller', 'true');
    if (newArrivalsOnly) params.set('newArrivals', 'true');
    if (inStockOnly) params.set('inStock', 'true');
    const range = priceRanges[priceRange];
    if (range.min > 0) params.set('minPrice', String(range.min));
    if (range.max > 0) params.set('maxPrice', String(range.max));
    const query = params.toString();
    router.push(query ? `?${query}` : '/products', { scroll: false });
  }, [router, pageSize, bestSellers, newArrivalsOnly, inStockOnly, priceRange, solution]);

  useEffect(() => {
    // Legacy Shop-by-Solution links used ?solution= — rewrite to ?category=
    // so filtering uses real category assignment (not ignored/loose keywords).
    const solParam = searchParams.get('solution');
    const catParam = searchParams.get('category');
    if (solParam && !catParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('solution');
      params.set('category', solParam);
      router.replace(`/products?${params.toString()}`, { scroll: false });
      return;
    }

    setSearch(searchParams.get('search') || '');
    setCategory(catParam || '');
    setSolution('');
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

    const minPrice = searchParams.get('minPrice') || searchParams.get('priceMin');
    const maxPrice = searchParams.get('maxPrice') || searchParams.get('priceMax');
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice, 10) : 0;
      const max = maxPrice ? parseInt(maxPrice, 10) : 0;
      const rangeIndex = priceRanges.findIndex(r => r.min === min && r.max === max);
      if (rangeIndex !== -1) {
        setPriceRange(rangeIndex);
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
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
    if (solution) params.solution = solution;
    if (condition) params.condition = condition;
    if (brand) params.brand = brand;
    if (sort) params.sort = sort;
    if (discountOnly || onSpecial) params.discount = 'true';
    if (inStockOnly) params.inStock = 'true';
    if (newArrivalsOnly) params.newArrivals = 'true';
    if (bestSellers) params.bestSeller = 'true';
    const range = priceRanges[priceRange];
    if (range.min > 0) params.minPrice = String(range.min);
    if (range.max > 0) params.maxPrice = String(range.max);
    if (underR500) params.maxPrice = '500';
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined) {
        delete params[key];
      }
    });
    productsApi.list(params)
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
      })
      .catch(() => { setProducts([]); })
      .finally(() => setLoading(false));
  }, [search, category, solution, condition, brand, sort, priceRange, page, pageSize, discountOnly, filterSlug, hasInitialData]);

  useEffect(() => {
    const sig = JSON.stringify([search, category, solution, condition, brand, sort, priceRange, selectedTags, discountOnly, filterSlug]);
    if (lastFilterSig.current === null) {
      lastFilterSig.current = sig;
      return;
    }
    if (lastFilterSig.current === sig) return;
    lastFilterSig.current = sig;
    setPage(1);
    updateQueryParams(1, search, category, condition, brand, sort, discountOnly, filterSlug, pageSize);
  }, [search, category, solution, condition, brand, sort, priceRange, selectedTags, discountOnly, pageSize, updateQueryParams, filterSlug]);

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

  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginatedProducts = products;
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

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
    window.location.href = '/products';
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

  const solutionLabel = getSolutionLabel(solution);
  const categoryChipLabel =
    getSolutionLabel(category) ||
    (category
      ? category.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : null);

  const categoryTitle = filterSlug && shopByLabels[filterSlug]
    ? shopByLabels[filterSlug].label
    : solutionLabel
    ? solutionLabel
    : categoryChipLabel
    ? categoryChipLabel
    : 'All Products';

  const selectClass =
    'h-11 shrink-0 appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-9 text-sm text-gray-800 focus:border-[#003d7a] focus:outline-none focus:ring-1 focus:ring-[#003d7a]/20';

  const filterPanel = (
    <div className="space-y-7">
      {filterSlug && shopByLabels[filterSlug] && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Shop By</h3>
          <div className="flex items-center gap-2 rounded-lg border border-[#003d7a]/25 bg-[#003d7a]/10 px-3 py-2 text-sm font-medium text-[#003d7a]">
            <span>{shopByLabels[filterSlug].icon}</span>
            <span className="flex-1">{shopByLabels[filterSlug].label}</span>
            <button type="button" onClick={() => router.push('/products')} className="transition-colors hover:text-red-500" title="Clear filter">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</h3>
        <div className="space-y-1">
          {categoryFilters.map((cat) => {
            const isActive = category === cat.value;
            const count = cat.value === '' ? totalCount : (categories.find((c: any) => c.slug === cat.value)?._count?.products ?? 0);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.value); setMobileFiltersOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'border border-[#003d7a]/25 bg-[#003d7a]/10 text-[#003d7a]'
                    : 'border border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <cat.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#003d7a]' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${isActive ? 'bg-[#003d7a]/20 text-[#003d7a]' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Brand</h3>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#003d7a] focus:outline-none focus:ring-1 focus:ring-[#003d7a]"
          >
            <option value="">All Brands</option>
            {brands.map((b: any) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Price Range</h3>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#003d7a] focus:outline-none focus:ring-1 focus:ring-[#003d7a]"
        >
          {priceRanges.map((range, i) => (
            <option key={i} value={i}>{range.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Condition</h3>
        <div className="flex gap-2">
          {conditionOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCondition(opt.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                condition === opt.value
                  ? 'border-[#003d7a]/25 bg-[#003d7a]/10 text-[#003d7a]'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Discount</h3>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-gray-200 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#003d7a] focus:ring-[#003d7a]"
          />
          <span className="text-sm text-gray-700">Discounted Only</span>
        </label>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tagFilters.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-[#003d7a]/25 bg-[#003d7a]/10 text-[#003d7a]'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <Tag className="-mt-0.5 mr-1 inline h-3 w-3" />
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#003d7a] sm:text-3xl">{categoryTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? 'Loading products…'
              : category || brand || filterSlug || solution
                ? `${totalCount.toLocaleString()} products found`
                : 'Explore our wide range of quality tech products.'}
          </p>
        </div>
        <ul className="hidden grid-cols-2 gap-x-6 gap-y-3 sm:grid lg:grid-cols-4">
          {trustSignals.map(({ icon: Icon, title, subtitle }) => (
            <li key={title} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#003d7a]/8 text-[#003d7a]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-gray-900">{title}</span>
                <span className="block text-[11px] text-gray-500">{subtitle}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Toolbar — search lives in the navbar only (no duplicate field) */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold lg:hidden ${
            activeFilterCount > 0
              ? 'border-[#003d7a] bg-[#003d7a] text-white'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <SlidersHorizontal className="size-4" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>

        <div className="relative min-w-[160px] flex-1 sm:flex-none">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${selectClass} w-full sm:w-[200px]`}
            aria-label="Filter by category"
          >
            {categoryFilters.map((cat) => (
              <option key={cat.id} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative min-w-[150px] flex-1 sm:flex-none">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              if (typeof window !== 'undefined') localStorage.setItem('productSort', e.target.value);
            }}
            className={`${selectClass} w-full sm:w-[200px]`}
            aria-label="Sort products"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>Sort by: {o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>

        {search ? (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              updateQueryParams(1, '', category, condition, brand, sort, discountOnly, filterSlug, pageSize, solution);
            }}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900"
          >
            <X className="size-3.5" />
            Clear “{search}”
          </button>
        ) : null}

        {categoryChipLabel ? (
          <button
            type="button"
            onClick={() => {
              setCategory('');
              setSolution('');
              updateQueryParams(1, search, '', condition, brand, sort, discountOnly, filterSlug, pageSize, '');
            }}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900"
          >
            <X className="size-3.5" />
            Clear “{categoryChipLabel}”
          </button>
        ) : null}
      </div>

      {/* Mobile category chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:hidden">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
            category === '' ? 'border-[#003d7a] bg-[#003d7a] text-white' : 'border-gray-200 bg-white text-gray-600'
          }`}
        >
          All
        </button>
        {categories.slice(0, 12).map((cat: any) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
              category === cat.slug ? 'border-[#003d7a] bg-[#003d7a] text-white' : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
          <button type="button" onClick={clearFilters} className="font-semibold text-[#003d7a] hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {Array.from({ length: Math.min(pageSize, 12) }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <Skeleton className="aspect-[4/3] rounded-none bg-gray-100" />
              <div className="space-y-2.5 p-4">
                <Skeleton className="h-3 w-16 bg-gray-100" />
                <Skeleton className="h-4 w-full bg-gray-100" />
                <Skeleton className="h-4 w-2/3 bg-gray-100" />
                <Skeleton className="mt-1 h-6 w-24 bg-gray-100" />
                <Skeleton className="h-10 w-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedProducts.length > 0 ? (
        <>
          {!mobileViewGrid ? (
            <div className="flex flex-col gap-2.5">
              {paginatedProducts.map((product) => {
                const img = product.images?.[0]?.url || '/assets/placeholder.svg';
                const disc = product.originalPrice && product.originalPrice > product.sellingPrice
                  ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : null;
                const inSt = (product.stockQuantity ?? 0) > 0 || (product.stockCpt ?? 0) > 0 || (product.stockJhb ?? 0) > 0 || (product.stockDbn ?? 0) > 0;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}?returnUrl=${encodeURIComponent(listReturnUrl)}`}
                    className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-transform hover:border-gray-300 active:scale-[0.99] sm:p-4"
                  >
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 sm:h-24 sm:w-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={product.name}
                        className="h-full w-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
                      />
                      {disc ? <span className="absolute left-1 top-1 rounded bg-red-500 px-1 text-[9px] font-bold text-white">-{disc}%</span> : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        {product.category?.name ? (
                          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{product.category.name}</p>
                        ) : null}
                        <p className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{product.name}</p>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${inSt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {inSt ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#003d7a] sm:text-base">{formatPrice(product.sellingPrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  returnUrl={listReturnUrl}
                />
              ))}
            </div>
          )}

          {/* Footer: count + pagination + view */}
          <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
            <p className="order-2 text-sm text-gray-500 sm:order-1">
              Showing {rangeStart}–{rangeEnd} of {totalCount.toLocaleString()} products
            </p>

            <div className="order-1 flex items-center gap-1.5 sm:order-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              {pageNumbers(safePage, totalPages).map((item, idx) =>
                item === '…' ? (
                  <span key={`e-${idx}`} className="px-1 text-sm text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={`flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                      item === safePage
                        ? 'bg-[#003d7a] text-white'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
                className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="order-3 flex items-center gap-3">
              <label className="hidden items-center gap-1.5 text-xs text-gray-500 sm:flex">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003d7a]"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>View:</span>
                <button
                  type="button"
                  onClick={() => setMobileViewGrid(true)}
                  aria-label="Grid view"
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    mobileViewGrid ? 'bg-[#003d7a] text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewGrid(false)}
                  aria-label="List view"
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    !mobileViewGrid ? 'bg-[#003d7a] text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
            <ShoppingBag className="h-9 w-9 text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No products found</h3>
          <p className="mx-auto mb-8 max-w-sm text-sm text-gray-500">
            We couldn&apos;t find anything matching your filters. Try adjusting your search or clearing filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003d7a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0055a4]"
          >
            <RotateCcw className="h-4 w-4" /> Clear all filters
          </button>
        </div>
      )}

      {/* Mobile filters drawer */}
      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">{filterPanel}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
