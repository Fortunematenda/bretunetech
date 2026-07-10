'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, Search, Edit, Trash2, Star, Eye,
  EyeOff, Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw,
  CheckSquare, Square, AlertTriangle, CheckCircle, MoreVertical, X, Download, Columns, ExternalLink,
} from 'lucide-react';
import { productsApi, categoriesApi, brandsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

const conditionColors: Record<string, string> = {
  NEW: 'bg-green-50 text-green-600 border-green-200',
  REFURBISHED: 'bg-amber-50 text-amber-700 border-amber-200',
};

function AdminProductsContent() {
  const { token, user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [conditionFilter, setConditionFilter] = useState(searchParams.get('condition') || '');
  const [featuredFilter, setFeaturedFilter] = useState(searchParams.get('featured') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit') || '20', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('statusFilter') || '');
  const [colDropdownOpen, setColDropdownOpen] = useState(false);

  type ColKey =
    | 'category' | 'brand' | 'sku' | 'condition'
    | 'stock' | 'stockCpt' | 'stockDbn' | 'stockJhb' | 'lowStockThreshold'
    | 'cost' | 'price' | 'originalPrice' | 'margin'
    | 'status' | 'featured' | 'rating' | 'reviews'
    | 'supplier' | 'shippingDays' | 'createdAt' | 'updatedAt' | 'discountExpiry';
  const ALL_COLS: { key: ColKey; label: string; group: string }[] = [
    { key: 'category',        label: 'Category',          group: 'Product' },
    { key: 'brand',           label: 'Brand',             group: 'Product' },
    { key: 'sku',             label: 'SKU',               group: 'Product' },
    { key: 'condition',       label: 'Condition',         group: 'Product' },
    { key: 'stock',           label: 'Stock (total)',     group: 'Inventory' },
    { key: 'stockCpt',        label: 'Stock CPT',         group: 'Inventory' },
    { key: 'stockDbn',        label: 'Stock DBN',         group: 'Inventory' },
    { key: 'stockJhb',        label: 'Stock JHB',         group: 'Inventory' },
    { key: 'lowStockThreshold', label: 'Low Stock Threshold', group: 'Inventory' },
    { key: 'cost',            label: 'Cost Price',        group: 'Pricing' },
    { key: 'price',           label: 'Sell Price',        group: 'Pricing' },
    { key: 'originalPrice',   label: 'Original Price',    group: 'Pricing' },
    { key: 'margin',          label: 'Margin %',          group: 'Pricing' },
    { key: 'discountExpiry',  label: 'Discount Expiry',   group: 'Pricing' },
    { key: 'status',          label: 'Active',            group: 'Flags' },
    { key: 'featured',        label: 'Featured',          group: 'Flags' },
    { key: 'rating',          label: 'Avg Rating',        group: 'Engagement' },
    { key: 'reviews',         label: 'Review Count',      group: 'Engagement' },
    { key: 'shippingDays',    label: 'Shipping Days',     group: 'Logistics' },
    { key: 'supplier',        label: 'Supplier',          group: 'Logistics' },
    { key: 'createdAt',       label: 'Created',           group: 'Meta' },
    { key: 'updatedAt',       label: 'Updated',           group: 'Meta' },
  ];
  const DEFAULT_COLS: ColKey[] = ['category', 'stock', 'cost', 'price', 'margin', 'status'];
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_products_cols');
      if (saved) setVisibleCols(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);
  const toggleCol = (key: ColKey) => {
    setVisibleCols((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem('admin_products_cols', JSON.stringify(next));
      return next;
    });
  };
  const col = (key: ColKey) => visibleCols.includes(key);
  const lastFilterSig = useRef<string | null>(null);

  // Update URL when filters or page change
  const updateQueryParams = useCallback((newPage: number, newSearch: string, newCategory: string, newCondition: string, newFeatured: string, newBrand: string, newLimit: number = pageSize) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newLimit !== 20) params.set('limit', String(newLimit));
    if (newSearch) params.set('search', newSearch);
    if (newCategory) params.set('category', newCategory);
    if (newCondition) params.set('condition', newCondition);
    if (newFeatured) params.set('featured', newFeatured);
    if (newBrand) params.set('brand', newBrand);
    const query = params.toString();
    router.push(query ? `?${query}` : '/admin/products', { scroll: false });
  }, [router, pageSize]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: String(pageSize), page: String(page), status: statusFilter || 'all' };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (featuredFilter) params.featured = featuredFilter;
      if (brandFilter) params.brand = brandFilter;
      const data = await productsApi.list(params);
      setProducts(data.products || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, conditionFilter, featuredFilter, brandFilter, page, pageSize, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoriesApi.list(true).then(setCategories).catch(() => {}); }, []);
  useEffect(() => { brandsApi.list().then(setBrands).catch(() => {}); }, []);
  // Sync state from URL (handles back-navigation where searchParams may be stale at mount)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategoryFilter(searchParams.get('category') || '');
    setConditionFilter(searchParams.get('condition') || '');
    setFeaturedFilter(searchParams.get('featured') || '');
    setBrandFilter(searchParams.get('brand') || '');
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setPageSize(parseInt(searchParams.get('limit') || '20', 10));
  }, [searchParams]);
  // Reset page when filters actually change (signature compare; strict-mode safe)
  useEffect(() => {
    const sig = JSON.stringify([search, categoryFilter, conditionFilter, featuredFilter, brandFilter]);
    if (lastFilterSig.current === null) {
      lastFilterSig.current = sig; // first render: record, don't reset
      return;
    }
    if (lastFilterSig.current === sig) return; // no real change (e.g. strict-mode re-run)
    lastFilterSig.current = sig;
    setPage(1);
    setSelected([]);
    setSelectAllPages(false);
    updateQueryParams(1, search, categoryFilter, conditionFilter, featuredFilter, brandFilter, pageSize);
  }, [search, categoryFilter, conditionFilter, featuredFilter, brandFilter, pageSize, updateQueryParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateQueryParams(newPage, search, categoryFilter, conditionFilter, featuredFilter, brandFilter);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateQueryParams(1, search, categoryFilter, conditionFilter, featuredFilter, brandFilter, newSize);
  };

  // Build returnUrl from current state so back navigation preserves page/filters
  const listReturnUrl = (() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (pageSize !== 20) params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (conditionFilter) params.set('condition', conditionFilter);
    if (featuredFilter) params.set('featured', featuredFilter);
    if (brandFilter) params.set('brand', brandFilter);
    const q = params.toString();
    return q ? `/admin/products?${q}` : '/admin/products';
  })();

  const toggleSelect = (id: string) => {
    setSelectAllPages(false);
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectAllPages(false);
    setSelected(selected.length === products.length ? [] : products.map((p) => p.id));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token || !confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActionBusy(true);
    try {
      await productsApi.delete(token, id);
      showToast('success', `"${name}" deleted`);
      fetchProducts();
    } catch {
      showToast('error', 'Delete failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggle = async (id: string, field: 'isFeatured' | 'isActive', current: boolean) => {
    if (!token) return;
    setActionBusy(true);
    try {
      await productsApi.update(token, id, { [field]: !current });
      fetchProducts();
    } catch {
      showToast('error', 'Update failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkPublish = async (newStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!token) return;
    setActionBusy(true);
    try {
      let ids = selected;
      if (selectAllPages) {
        const params: Record<string, string> = { limit: String(totalCount), page: '1', status: 'all' };
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;
        if (conditionFilter) params.condition = conditionFilter;
        if (brandFilter) params.brand = brandFilter;
        const data = await productsApi.list(params);
        ids = (data.products || []).map((p: any) => p.id);
      }
      if (ids.length === 0) return;
      // Send in batches of 100 to avoid request size limits
      for (let i = 0; i < ids.length; i += 100) {
        await productsApi.bulkStatus(token, ids.slice(i, i + 100), newStatus);
      }
      showToast('success', `${newStatus === 'PUBLISHED' ? 'Published' : 'Set to draft'} ${ids.length} product${ids.length !== 1 ? 's' : ''}`);
      setSelected([]);
      setSelectAllPages(false);
      fetchProducts();
    } catch {
      showToast('error', 'Status update failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkUpdate = async (field: 'isActive' | 'isFeatured', value: boolean) => {
    const ids = selected;
    if (!token || ids.length === 0) return;
    setActionBusy(true);
    try {
      await Promise.all(ids.map((id) => productsApi.update(token, id, { [field]: value })));
      const label = field === 'isActive' ? (value ? 'Activated' : 'Deactivated') : (value ? 'Featured' : 'Unfeatured');
      showToast('success', `${label} ${ids.length} product${ids.length !== 1 ? 's' : ''}`);
      setSelected([]);
      fetchProducts();
    } catch {
      showToast('error', 'Bulk update failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectAllPages ? totalCount : selected.length;
    if (!token || count === 0 || !confirm(`Delete ${count} products? This cannot be undone.`)) return;
    setActionBusy(true);
    try {
      if (selectAllPages) {
        // Fetch all IDs matching current filters then delete
        const params: Record<string, string> = { limit: String(totalCount), page: '1' };
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;
        if (conditionFilter) params.condition = conditionFilter;
        if (featuredFilter) params.featured = featuredFilter;
        if (brandFilter) params.brand = brandFilter;
        params.status = 'all';
        const data = await productsApi.list(params);
        const allIds = (data.products || []).map((p: any) => p.id);
        let deleted = 0;
        for (const id of allIds) {
          try { await productsApi.delete(token, id); deleted++; } catch {}
        }
        showToast('success', `Deleted ${deleted} products`);
      } else {
        let deleted = 0;
        for (const id of selected) {
          try { await productsApi.delete(token, id); deleted++; } catch {}
        }
        showToast('success', `Deleted ${deleted} products`);
      }
    } finally {
      setSelected([]);
      setSelectAllPages(false);
      fetchProducts();
      setActionBusy(false);
    }
  };

  const handleExport = async () => {
    if (!token) return;
    setActionBusy(true);
    try {
      const params: Record<string, string> = {};
      if (selectAllPages) {
        // Export ALL matching products using current filters (no ID limit)
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;
        if (conditionFilter) params.condition = conditionFilter;
        if (featuredFilter) params.featured = featuredFilter;
        if (brandFilter) params.brand = brandFilter;
      } else if (selected.length > 0) {
        // Export only the explicitly selected products on current page
        params.ids = selected.join(',');
      } else {
        // No selection — export everything with active filters
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;
        if (conditionFilter) params.condition = conditionFilter;
        if (featuredFilter) params.featured = featuredFilter;
        if (brandFilter) params.brand = brandFilter;
      }

      const blob = await productsApi.export(token, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', 'Products exported successfully');
    } catch {
      showToast('error', 'Export failed');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-600'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{totalCount} products</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <div className="relative">
            <button
              onClick={() => setColDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Columns className="w-4 h-4" /> Columns
            </button>
            {colDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setColDropdownOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-52 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                  <div className="max-h-[420px] overflow-y-auto py-1">
                    {Array.from(new Set(ALL_COLS.map((c) => c.group))).map((group) => (
                      <div key={group}>
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">{group}</p>
                        {ALL_COLS.filter((c) => c.group === group).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => toggleCol(key)}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-white transition-colors"
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              col(key) ? 'bg-violet-600 border-violet-500' : 'border-gray-300'
                            }`}>
                              {col(key) && <CheckSquare className="w-3 h-3 text-gray-900" />}
                            </span>
                            {label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 px-3 py-2 flex gap-2">
                    <button
                      onClick={() => { const all = ALL_COLS.map(c => c.key); setVisibleCols(all); localStorage.setItem('admin_products_cols', JSON.stringify(all)); }}
                      className="flex-1 text-xs text-gray-500 hover:text-white transition-colors text-center py-1 rounded hover:bg-gray-100"
                    >
                      Show all
                    </button>
                    <div className="w-px bg-gray-700" />
                    <button
                      onClick={() => { setVisibleCols(DEFAULT_COLS); localStorage.setItem('admin_products_cols', JSON.stringify(DEFAULT_COLS)); }}
                      className="flex-1 text-xs text-gray-500 hover:text-white transition-colors text-center py-1 rounded hover:bg-gray-100"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={actionBusy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Conditions</option>
          <option value="NEW">New</option>
          <option value="REFURBISHED">Refurbished</option>
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Products</option>
          <option value="true">Featured Only</option>
          <option value="false">Not Featured</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>

        {/* Collapsible Brand Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500 flex items-center gap-2 min-w-[120px]"
          >
            {brandFilter ? brands.find(b => b.slug === brandFilter)?.name || brandFilter : 'All Brands'}
            <span className={`ml-auto transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {brandDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBrandDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-100 border border-gray-300 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setBrandFilter(''); setBrandDropdownOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-700 transition-colors"
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setBrandFilter(brand.slug); setBrandDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {(selected.length > 0 || selectAllPages) && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-violet-600/10 border border-violet-200 rounded-xl">
          <span className="text-sm text-violet-600 font-medium">
            {selectAllPages ? `All ${totalCount} products selected` : `${selected.length} selected`}
          </span>
          {/* Offer to select across all pages when current page is fully checked */}
          {!selectAllPages && selected.length === products.length && totalCount > products.length && (
            <button
              onClick={() => setSelectAllPages(true)}
              className="text-xs text-violet-700 hover:text-white underline transition-colors"
            >
              Select all {totalCount} products
            </button>
          )}
          {selectAllPages && (
            <button
              onClick={() => { setSelectAllPages(false); setSelected([]); }}
              className="text-xs text-gray-500 hover:text-white underline transition-colors"
            >
              Undo — select current page only
            </button>
          )}
          {!selectAllPages && (
            <>
              <button
                onClick={() => handleBulkUpdate('isActive', true)}
                disabled={actionBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5" /> Activate
              </button>
              <button
                onClick={() => handleBulkUpdate('isActive', false)}
                disabled={actionBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-700 text-xs font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
              >
                <EyeOff className="w-3.5 h-3.5" /> Deactivate
              </button>
              <button
                onClick={() => handleBulkUpdate('isFeatured', true)}
                disabled={actionBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-colors disabled:opacity-50"
              >
                <Star className="w-3.5 h-3.5" /> Feature
              </button>
              <button
                onClick={() => handleBulkUpdate('isFeatured', false)}
                disabled={actionBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-700 text-xs font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
              >
                <Star className="w-3.5 h-3.5" /> Unfeature
              </button>
                  <div className="w-px h-5 bg-gray-700" />
            </>
          )}
          <button
            onClick={() => handleBulkPublish('PUBLISHED')}
            disabled={actionBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
          >
            🌐 Publish
          </button>
          <button
            onClick={() => handleBulkPublish('DRAFT')}
            disabled={actionBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
          >
            📄 Set Draft
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={actionBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete {selectAllPages ? `all ${totalCount}` : selected.length}
          </button>
          <button
            onClick={() => { setSelected([]); setSelectAllPages(false); }}
            className="text-xs text-gray-500 hover:text-white transition-colors ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleAll} className="text-gray-500 hover:text-white transition-colors">
                    {(selectAllPages || (selected.length === products.length && products.length > 0))
                      ? <CheckSquare className="w-4 h-4 text-violet-600" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                {col('sku')            && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                {col('category')       && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>}
                {col('brand')          && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>}
                {col('condition')      && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>}
                {col('stock')          && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>}
                {col('stockCpt')       && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CPT</th>}
                {col('stockDbn')       && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DBN</th>}
                {col('stockJhb')       && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">JHB</th>}
                {col('lowStockThreshold') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock</th>}
                {col('cost')           && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>}
                {col('price')          && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>}
                {col('originalPrice')  && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orig. Price</th>}
                {col('margin')         && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin</th>}
                {col('discountExpiry') && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disc. Expiry</th>}
                {col('status')         && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>}
                {col('featured')       && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>}
                {col('rating')         && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>}
                {col('reviews')        && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviews</th>}
                {col('shippingDays')   && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ship Days</th>}
                {col('supplier')       && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>}
                {col('createdAt')      && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>}
                {col('updatedAt')      && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>}
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="w-4 h-4 bg-white rounded" /></td>
                    {col('sku')            && <td className="px-4 py-4"><div className="h-3 w-20 bg-white rounded" /></td>}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg" />
                        <div className="h-3 w-36 bg-white rounded" />
                      </div>
                    </td>
                    {col('category')       && <td className="px-4 py-4"><div className="h-3 w-24 bg-white rounded" /></td>}
                    {col('brand')          && <td className="px-4 py-4"><div className="h-3 w-20 bg-white rounded" /></td>}
                    {col('condition')      && <td className="px-4 py-4"><div className="h-4 w-16 bg-white rounded-full" /></td>}
                    {col('stock')          && <td className="px-4 py-4"><div className="h-3 w-20 bg-white rounded" /></td>}
                    {col('stockCpt')       && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('stockDbn')       && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('stockJhb')       && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('lowStockThreshold') && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('cost')           && <td className="px-4 py-4"><div className="h-3 w-16 bg-white rounded" /></td>}
                    {col('price')          && <td className="px-4 py-4"><div className="h-3 w-16 bg-white rounded" /></td>}
                    {col('originalPrice')  && <td className="px-4 py-4"><div className="h-3 w-16 bg-white rounded" /></td>}
                    {col('margin')         && <td className="px-4 py-4"><div className="h-3 w-12 bg-white rounded" /></td>}
                    {col('discountExpiry') && <td className="px-4 py-4"><div className="h-3 w-24 bg-white rounded" /></td>}
                    {col('status')         && <td className="px-4 py-4"><div className="h-5 w-14 bg-white rounded-full" /></td>}
                    {col('featured')       && <td className="px-4 py-4"><div className="h-5 w-14 bg-white rounded-full" /></td>}
                    {col('rating')         && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('reviews')        && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('shippingDays')   && <td className="px-4 py-4"><div className="h-3 w-10 bg-white rounded" /></td>}
                    {col('supplier')       && <td className="px-4 py-4"><div className="h-3 w-24 bg-white rounded" /></td>}
                    {col('createdAt')      && <td className="px-4 py-4"><div className="h-3 w-24 bg-white rounded" /></td>}
                    {col('updatedAt')      && <td className="px-4 py-4"><div className="h-3 w-24 bg-white rounded" /></td>}
                    <td className="px-4 py-4"><div className="h-3 w-20 bg-white rounded ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No products found</p>
                    <Link href="/admin/products/new" className="inline-flex items-center gap-1 mt-3 text-sm text-violet-600 hover:text-cyan-700">
                      <Plus className="w-4 h-4" /> Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product, rowIndex) => {
                  const isLow = product.stockQuantity <= (product.lowStockThreshold ?? 5) && product.stockQuantity > 0;
                  const isOut = product.stockQuantity === 0;
                  const cost = product.costPrice ?? 0;
                  const sell = product.sellingPrice ?? 0;
                  const margin = sell > 0 ? Math.round(((sell - cost) / sell) * 100) : 0;
                  const threshold = product.lowStockThreshold ?? 5;
                  const pct = Math.min(100, threshold > 0 ? (product.stockQuantity / (threshold * 4)) * 100 : (product.stockQuantity / 50) * 100);
                  return (
                    <tr
                      key={product.id}
                      onClick={() => router.push(`/admin/products/${product.id}?returnUrl=${encodeURIComponent(listReturnUrl)}`)}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected.includes(product.id) ? 'bg-violet-600/5' : ''}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(product.id)} className="text-gray-500 hover:text-violet-600 transition-colors">
                          {selected.includes(product.id)
                            ? <CheckSquare className="w-4 h-4 text-violet-600" />
                            : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      {col('sku')           && <td className="px-4 py-3 text-gray-500 text-xs font-mono">{product.sku || '—'}</td>}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 bg-white rounded-lg shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                                onError={(e) => { 
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement?.classList.add('has-fallback');
                                }}
                              />
                            ) : null}
                            <Package className={`w-5 h-5 text-gray-600 ${product.images?.[0]?.url ? 'hidden' : 'block'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm line-clamp-1 max-w-[200px]">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      {col('category')      && <td className="px-4 py-3 text-gray-500 text-sm">{product.category?.name || '—'}</td>}
                      {col('brand')         && <td className="px-4 py-3 text-gray-500 text-sm">{product.brand?.name || '—'}</td>}
                      {col('condition')     && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded border ${conditionColors[product.condition] || 'bg-gray-700 text-gray-500 border-gray-300'}`}>{product.condition}</span>
                        </td>
                      )}
                      {col('stock') && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`text-sm font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-emerald-600'}`}>{product.stockQuantity}</span>
                            {isOut && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full border border-red-200">OUT</span>}
                            {isLow && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">LOW</span>}
                          </div>
                        </td>
                      )}
                      {col('stockCpt')      && <td className="px-4 py-3 text-gray-500 text-sm text-center">{product.stockCpt ?? 0}</td>}
                      {col('stockDbn')      && <td className="px-4 py-3 text-gray-500 text-sm text-center">{product.stockDbn ?? 0}</td>}
                      {col('stockJhb')      && <td className="px-4 py-3 text-gray-500 text-sm text-center">{product.stockJhb ?? 0}</td>}
                      {col('lowStockThreshold') && <td className="px-4 py-3 text-gray-500 text-sm text-center">{product.lowStockThreshold ?? 5}</td>}
                      {col('cost')          && <td className="px-4 py-3 text-gray-500 text-sm">{cost > 0 ? formatPrice(cost) : '—'}</td>}
                      {col('price')         && <td className="px-4 py-3 text-gray-900 font-medium text-sm">{formatPrice(sell)}</td>}
                      {col('originalPrice') && <td className="px-4 py-3 text-gray-500 text-sm line-through">{product.originalPrice ? formatPrice(product.originalPrice) : '—'}</td>}
                      {col('margin') && (
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${margin >= 20 ? 'text-emerald-600' : margin >= 10 ? 'text-amber-700' : 'text-red-600'}`}>
                            {cost > 0 ? `${margin}%` : '—'}
                          </span>
                        </td>
                      )}
                      {col('discountExpiry') && (
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {product.discountExpiresAt ? new Date(product.discountExpiresAt).toLocaleDateString() : '—'}
                        </td>
                      )}
                      {col('status') && (
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                              product.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                            }`}>{product.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                              (product.isActive ?? true) ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                            }`}>{(product.isActive ?? true) ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                      )}
                      {col('featured') && (
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            product.isFeatured ? 'bg-amber-50 text-amber-700' : 'bg-gray-700 text-gray-500'
                          }`}>{product.isFeatured ? 'Yes' : 'No'}</span>
                        </td>
                      )}
                      {col('rating') && (
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {product.averageRating > 0 ? (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-700 fill-current" />
                              {Number(product.averageRating).toFixed(1)}
                            </span>
                          ) : '—'}
                        </td>
                      )}
                      {col('reviews')      && <td className="px-4 py-3 text-gray-500 text-sm text-center">{product.reviewCount ?? 0}</td>}
                      {col('shippingDays') && <td className="px-4 py-3 text-gray-500 text-sm text-center">{product.shippingDays ?? 3}d</td>}
                      {col('supplier')    && <td className="px-4 py-3 text-gray-500 text-sm">{product.supplierName || '—'}</td>}
                      {col('createdAt')   && <td className="px-4 py-3 text-gray-500 text-xs">{new Date(product.createdAt).toLocaleDateString()}</td>}
                      {col('updatedAt')   && <td className="px-4 py-3 text-gray-500 text-xs">{new Date(product.updatedAt).toLocaleDateString()}</td>}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === product.id ? null : product.id); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === product.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className={`absolute right-0 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${
                                rowIndex >= products.length - 3 ? 'bottom-8' : 'top-8'
                              }`}>
                                <button
                                  onClick={() => { setOpenMenuId(null); setDetailProduct(product); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Quick Preview
                                </button>
                                <Link
                                  href={`/admin/products/${product.id}?returnUrl=${encodeURIComponent(listReturnUrl)}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-violet-600 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit Product
                                </Link>
                                <Link
                                  href={`/products/${product.slug}`}
                                  target="_blank"
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-sky-600 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> View on Store
                                </Link>
                                <div className="border-t border-gray-200 mx-2" />
                                <button
                                  onClick={() => { setOpenMenuId(null); handleToggle(product.id, 'isFeatured', product.isFeatured); }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-amber-700 transition-colors disabled:opacity-50"
                                >
                                  <Star className="w-3.5 h-3.5" /> {product.isFeatured ? 'Unfeature' : 'Feature'}
                                </button>
                                <button
                                  onClick={() => { setOpenMenuId(null); handleToggle(product.id, 'isActive', product.isActive ?? true); }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                >
                                  {(product.isActive ?? true) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  {(product.isActive ?? true) ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={async () => { setOpenMenuId(null); setActionBusy(true); try { await productsApi.bulkStatus(token!, [product.id], product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'); fetchProducts(); } catch { showToast('error', 'Failed'); } finally { setActionBusy(false); } }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors disabled:opacity-50"
                                >
                                  {product.status === 'PUBLISHED' ? '📄 Set as Draft' : '🌐 Publish'}
                                </button>
                                <div className="border-t border-gray-200 mx-2" />
                                <button
                                  onClick={() => { setOpenMenuId(null); handleDelete(product.id, product.name); }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                className="bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {[10, 20, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>entries</span>
            </div>

            {/* Showing X to Y + controls */}
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500">
                Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={page <= 1}
                  title="First page"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  title="Previous page"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-8 h-8 px-2 rounded-lg text-xs font-medium bg-violet-600 text-white flex items-center justify-center">
                  {page}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  title="Next page"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page >= totalPages}
                  title="Last page"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Product Detail Drawer */}
      {detailProduct && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDetailProduct(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 line-clamp-1 pr-4">{detailProduct.name}</h2>
              <button onClick={() => setDetailProduct(null)} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Image */}
              {detailProduct.images?.[0]?.url && (
                <div className="w-full h-48 bg-white rounded-xl overflow-hidden border border-gray-200">
                  <img src={detailProduct.images[0].url} alt={detailProduct.name} className="w-full h-full object-cover object-center"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${conditionColors[detailProduct.condition] || 'bg-gray-700 text-gray-500 border-gray-300'}`}>
                  {detailProduct.condition}
                </span>
                {detailProduct.isFeatured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  (detailProduct.isActive ?? true) ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-700 text-gray-500 border border-gray-300'
                }`}>
                  {(detailProduct.isActive ?? true) ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Pricing */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pricing</p>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Selling Price</span><span className="text-gray-900 font-semibold">{formatPrice(detailProduct.sellingPrice)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Cost Price</span><span className="text-gray-700">{formatPrice(detailProduct.costPrice)}</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Margin</span>
                  <span className="text-emerald-600 font-medium">
                    {detailProduct.costPrice > 0 ? `${(((detailProduct.sellingPrice - detailProduct.costPrice) / detailProduct.costPrice) * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Stock */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Inventory</p>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Stock</span>
                  <span className={`font-semibold ${
                    detailProduct.stockQuantity === 0 ? 'text-red-600' :
                    detailProduct.stockQuantity <= (detailProduct.lowStockThreshold ?? 5) ? 'text-amber-700' : 'text-emerald-600'
                  }`}>{detailProduct.stockQuantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Cape Town</span>
                  <span className={`font-medium ${(detailProduct.stockCpt ?? 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>{detailProduct.stockCpt ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Johannesburg</span>
                  <span className={`font-medium ${(detailProduct.stockJhb ?? 0) > 0 ? 'text-blue-600' : 'text-gray-500'}`}>{detailProduct.stockJhb ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /> Durban</span>
                  <span className={`font-medium ${(detailProduct.stockDbn ?? 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>{detailProduct.stockDbn ?? 0}</span>
                </div>
                {detailProduct.sku && <div className="flex justify-between text-sm"><span className="text-gray-500">SKU</span><span className="text-gray-700 font-mono text-xs">{detailProduct.sku}</span></div>}
                {detailProduct.supplierName && <div className="flex justify-between text-sm"><span className="text-gray-500">Supplier</span><span className="text-gray-700">{detailProduct.supplierName}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Category</span><span className="text-gray-700">{detailProduct.category?.name || '—'}</span></div>
                {detailProduct.brand?.name && detailProduct.brand.name !== detailProduct.supplierName && <div className="flex justify-between text-sm"><span className="text-gray-500">Brand</span><span className="text-gray-700">{detailProduct.brand.name}</span></div>}
              </div>

              {/* Description */}
              {detailProduct.description && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Description</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{detailProduct.description}</p>
                </div>
              )}

              {/* Tags */}
              {detailProduct.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailProduct.tags.map((t: any) => (
                    <span key={t.id || t.tag} className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded-full text-xs text-gray-500">{t.tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/admin/products/${detailProduct.id}?returnUrl=${encodeURIComponent(listReturnUrl)}`} onClick={() => setDetailProduct(null)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
                  <Edit className="w-4 h-4" /> Edit Product
                </Link>
                <Link href={`/products/${detailProduct.slug}`} target="_blank"
                  className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  <Eye className="w-4 h-4" /> View Store
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}

