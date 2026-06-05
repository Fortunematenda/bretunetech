'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, Monitor, X, ChevronLeft, ChevronRight,
  LayoutGrid, Zap, Wifi, Cable, Package, Tag, RotateCcw, ShoppingBag, Camera,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import Container from '@/components/layout/Container';

/* ── Constants ───────────────────────────────────────── */

const ITEMS_PER_PAGE = 12;

const categoryFilters = [
  { value: '', label: 'All Categories', icon: LayoutGrid, count: 0 },
  { value: 'technology', label: 'Technology', icon: Monitor, count: 0 },
  { value: 'power-solutions', label: 'Power Solutions', icon: Zap, count: 0 },
  { value: 'internet-networking', label: 'Networking', icon: Wifi, count: 0 },
  { value: 'cameras', label: 'Cameras', icon: Camera, count: 0 },
  { value: 'accessories', label: 'Accessories', icon: Cable, count: 0 },
];

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

const sampleProducts = [
  { id: '1', name: 'Refurbished Dell Latitude 5520', slug: 'refurbished-dell-latitude-5520', sellingPrice: 6999, condition: 'REFURBISHED', category: { name: 'Technology', slug: 'technology' }, images: [{ url: '/assets/products-pics/Refurbished-Dell-Latitude-5520-p1.jfif' }], tags: [{ tag: 'Best Value' }], stockQuantity: 15 },
  { id: '2', name: 'Lenovo ThinkPad T14 Gen 3', slug: 'lenovo-thinkpad-t14-gen3', sellingPrice: 12499, condition: 'NEW', category: { name: 'Technology', slug: 'technology' }, images: [{ url: '/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-1.jfif' }], tags: [{ tag: 'Premium' }], stockQuantity: 8 },
  { id: '3', name: 'Mecer 1200VA UPS', slug: 'mecer-1200va-ups', sellingPrice: 2699, condition: 'NEW', category: { name: 'Power Solutions', slug: 'power-solutions' }, images: [{ url: '/assets/products-pics/Mecer-1200VA-UPS-1.jfif' }], tags: [{ tag: 'Load Shedding Ready' }, { tag: 'Best Seller' }], stockQuantity: 25 },
  { id: '4', name: 'Must 3KW Hybrid Solar Inverter', slug: 'must-3kw-hybrid-inverter', sellingPrice: 8499, condition: 'NEW', category: { name: 'Power Solutions', slug: 'power-solutions' }, images: [{ url: '/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter1.jfif' }], tags: [{ tag: 'Load Shedding Ready' }], stockQuantity: 10 },
  { id: '5', name: 'Hubble AM-2 5.1kWh Lithium Battery', slug: 'hubble-am2-51v-lithium-battery', sellingPrice: 16999, condition: 'NEW', category: { name: 'Power Solutions', slug: 'power-solutions' }, images: [{ url: '/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery1.jfif' }], tags: [{ tag: 'Premium' }], stockQuantity: 6 },
  { id: '6', name: 'MikroTik hAP ac3 Router', slug: 'mikrotik-hap-ac3', sellingPrice: 2299, condition: 'NEW', category: { name: 'Internet & Networking', slug: 'internet-networking' }, images: [{ url: '/assets/products-pics/MikroTik-hAP-ac3-Router.jfif' }], tags: [{ tag: 'Best Seller' }], stockQuantity: 20 },
  { id: '7', name: 'Ubiquiti UniFi U6 Lite AP', slug: 'ubiquiti-unifi-u6-lite', sellingPrice: 2199, condition: 'NEW', category: { name: 'Internet & Networking', slug: 'internet-networking' }, images: [{ url: '/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP1.jfif' }], tags: [{ tag: 'Premium' }], stockQuantity: 12 },
  { id: '8', name: 'CAT6 Network Cable 305m', slug: 'cat6-network-cable-305m', sellingPrice: 1299, condition: 'NEW', category: { name: 'Accessories', slug: 'accessories' }, images: [{ url: '/assets/products-pics/CAT6-Network-Cable-305m.jfif' }], tags: [], stockQuantity: 30 },
  { id: '9', name: 'Logitech MK270 Wireless Combo', slug: 'logitech-mk270-wireless-combo', sellingPrice: 599, condition: 'NEW', category: { name: 'Accessories', slug: 'accessories' }, images: [{ url: '/assets/products-pics/voltnet-logo.jfif' }], tags: [{ tag: 'Best Value' }], stockQuantity: 40 },
  { id: '10', name: 'Hikvision 4MP IP Camera', slug: 'hikvision-4mp-ip-camera', sellingPrice: 1899, condition: 'NEW', category: { name: 'Cameras', slug: 'cameras' }, images: [{ url: '/assets/products-pics/voltnet-logo.jfif' }], tags: [{ tag: 'Best Seller' }], stockQuantity: 18 },
  { id: '11', name: 'Dahua 8MP 4K IP Camera', slug: 'dahua-8mp-4k-ip-camera', sellingPrice: 3499, condition: 'NEW', category: { name: 'Cameras', slug: 'cameras' }, images: [{ url: '/assets/products-pics/voltnet-logo.jfif' }], tags: [{ tag: 'Premium' }], stockQuantity: 12 },
  { id: '12', name: 'Ubiquiti UniFi G4 Bullet', slug: 'ubiquiti-unifi-g4-bullet', sellingPrice: 2999, condition: 'NEW', category: { name: 'Cameras', slug: 'cameras' }, images: [{ url: '/assets/products-pics/voltnet-logo.jfif' }], tags: [{ tag: 'Best Value' }], stockQuantity: 15 },
  { id: '13', name: 'Ezviz C6N Pan & Tilt', slug: 'ezviz-c6n-pan-tilt', sellingPrice: 899, condition: 'NEW', category: { name: 'Cameras', slug: 'cameras' }, images: [{ url: '/assets/products-pics/voltnet-logo.jfif' }], tags: [{ tag: 'New' }], stockQuantity: 25 },
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
  const [products, setProducts] = useState<any[]>(sampleProducts);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [priceRange, setPriceRange] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setCondition(searchParams.get('condition') || '');
    setSort(searchParams.get('sort') || '');
    setPage(1);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    productsApi.list({ limit: '100' })
      .then((data) => {
        if (data.products?.length) {
          const merged = data.products.map((p: any) => {
            const sample = sampleProducts.find((s) => s.slug === p.slug);
            const img = p.images?.[0]?.url;
            if (sample && (!img || img.startsWith('/images/products/'))) {
              return { ...p, images: sample.images };
            }
            return p;
          });
          setProducts(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '': products.length };
    products.forEach((p) => {
      const slug = p.category?.slug || '';
      counts[slug] = (counts[slug] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && p.category?.slug !== category) return false;
      if (condition && p.condition !== condition) return false;
      const range = priceRanges[priceRange];
      if (range.min > 0 && p.sellingPrice < range.min) return false;
      if (range.max > 0 && p.sellingPrice > range.max) return false;
      if (selectedTags.length > 0) {
        const productTags = p.tags?.map((t: any) => t.tag) || [];
        if (!selectedTags.some((t) => productTags.includes(t))) return false;
      }
      return true;
    }).sort((a: any, b: any) => {
      if (sort === 'price_asc') return a.sellingPrice - b.sellingPrice;
      if (sort === 'price_desc') return b.sellingPrice - a.sellingPrice;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, search, category, condition, sort, priceRange, selectedTags]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, category, condition, sort, priceRange, selectedTags]);

  const activeFilterCount = [category, condition, priceRange > 0, selectedTags.length > 0].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setSort('');
    setPriceRange(0);
    setSelectedTags([]);
    setPage(1);
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
            const count = categoryCounts[cat.value] || 0;
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
              {loading ? 'Loading products...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
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
              onChange={(e) => setSort(e.target.value)}
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
              onChange={(e) => setSort(e.target.value)}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* ── Pagination ──────────────────────────── */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-500">
                    Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      // Show first, last, and pages near current
                      if (p === 1 || p === totalPages || (p >= safePage - 1 && p <= safePage + 1)) {
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                              p === safePage
                                ? 'bg-[#003d7a] text-white shadow-lg shadow-[#003d7a]/20'
                                : 'text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      // Ellipsis
                      if (p === safePage - 2 || p === safePage + 2) {
                        return <span key={p} className="text-gray-400 px-1">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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
