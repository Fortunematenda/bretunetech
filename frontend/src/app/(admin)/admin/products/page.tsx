'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Edit, Trash2, Star, Eye,
  EyeOff, Package, ChevronLeft, ChevronRight, RefreshCw,
  CheckSquare, Square, AlertTriangle, CheckCircle, MoreVertical, X,
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

const conditionColors: Record<string, string> = {
  NEW: 'bg-green-500/15 text-green-400 border-green-500/25',
  REFURBISHED: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

export default function AdminProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '20', page: String(page) };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (featuredFilter) params.featured = featuredFilter;
      const data = await productsApi.list(params);
      setProducts(data.products || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, conditionFilter, featuredFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoriesApi.list().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { setPage(1); setSelected([]); setSelectAllPages(false); }, [search, categoryFilter, conditionFilter, featuredFilter]);

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

  const handleDeleteAllInCategory = async () => {
    if (!token || !categoryFilter) return;
    if (!confirm(`Permanently delete ALL products in category "${categoryFilter}"? This CANNOT be undone.`)) return;
    setActionBusy(true);
    try {
      const result = await productsApi.deleteByCategory(token, categoryFilter);
      showToast('success', result.message || `Deleted ${result.deleted} products`);
      setSelected([]);
      fetchProducts();
    } catch {
      showToast('error', 'Delete failed');
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

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-green-500/15 border-green-500/30 text-green-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-slate-400 text-sm mt-0.5">{totalCount} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-slate-900 text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Conditions</option>
          <option value="NEW">New</option>
          <option value="REFURBISHED">Refurbished</option>
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Products</option>
          <option value="true">Featured Only</option>
          <option value="false">Not Featured</option>
        </select>
      </div>

      {/* Delete All in Category */}
      {categoryFilter && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl">
          <span className="text-sm text-red-400 font-medium">Category: <span className="font-bold">{categoryFilter}</span> — {totalCount} products</span>
          <button
            onClick={handleDeleteAllInCategory}
            disabled={actionBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded-lg border border-red-500/30 transition-colors disabled:opacity-50 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete ALL in this category
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {(selected.length > 0 || selectAllPages) && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-violet-600/10 border border-violet-500/25 rounded-xl">
          <span className="text-sm text-violet-400 font-medium">
            {selectAllPages ? `All ${totalCount} products selected` : `${selected.length} selected`}
          </span>
          {/* Offer to select across all pages when current page is fully checked */}
          {!selectAllPages && selected.length === products.length && totalCount > products.length && (
            <button
              onClick={() => setSelectAllPages(true)}
              className="text-xs text-violet-300 hover:text-white underline transition-colors"
            >
              Select all {totalCount} products
            </button>
          )}
          {selectAllPages && (
            <button
              onClick={() => { setSelectAllPages(false); setSelected([]); }}
              className="text-xs text-slate-400 hover:text-white underline transition-colors"
            >
              Undo — select current page only
            </button>
          )}
          <button
            onClick={handleBulkDelete}
            disabled={actionBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium rounded-lg border border-red-500/25 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete {selectAllPages ? `all ${totalCount}` : selected.length}
          </button>
          <button
            onClick={() => { setSelected([]); setSelectAllPages(false); }}
            className="text-xs text-slate-400 hover:text-white transition-colors ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-white transition-colors">
                    {(selectAllPages || (selected.length === products.length && products.length > 0))
                      ? <CheckSquare className="w-4 h-4 text-violet-400" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="w-4 h-4 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg" />
                        <div className="space-y-2">
                          <div className="h-3 w-36 bg-slate-800 rounded" />
                          <div className="h-2 w-20 bg-slate-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-3 w-24 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-3 w-16 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-3 w-12 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-16 bg-slate-800 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-3 w-20 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No products found</p>
                    <Link href="/admin/products/new" className="inline-flex items-center gap-1 mt-3 text-sm text-violet-400 hover:text-cyan-300">
                      <Plus className="w-4 h-4" /> Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLow = product.stockQuantity <= (product.lowStockThreshold ?? 5) && product.stockQuantity > 0;
                  const isOut = product.stockQuantity === 0;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => setDetailProduct(product)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${selected.includes(product.id) ? 'bg-violet-600/5' : ''}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(product.id)} className="text-slate-400 hover:text-violet-400 transition-colors">
                          {selected.includes(product.id)
                            ? <CheckSquare className="w-4 h-4 text-violet-400" />
                            : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-10 h-10 bg-slate-800 rounded-lg shrink-0 overflow-hidden border border-slate-700 flex items-center justify-center">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { 
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement?.classList.add('has-fallback');
                                }}
                              />
                            ) : null}
                            <Package className={`w-5 h-5 text-slate-600 ${product.images?.[0]?.url ? 'hidden' : 'block'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm line-clamp-1 max-w-[200px]">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded border ${conditionColors[product.condition] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                {product.condition}
                              </span>
                              {product.sku && <span className="text-[10px] text-slate-500 font-mono">{product.sku}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{product.category?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{formatPrice(product.sellingPrice)}</p>
                        {product.costPrice && (
                          <p className="text-[11px] text-slate-500">Cost: {formatPrice(product.costPrice)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                          isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {isOut ? <AlertTriangle className="w-3 h-3" /> : isLow ? <AlertTriangle className="w-3 h-3" /> : null}
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {product.isFeatured && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            (product.isActive ?? true) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {(product.isActive ?? true) ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex justify-end">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === product.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-8 z-20 w-44 bg-[#1a1d27] border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                                <Link
                                  href={`/products/${product.slug}`}
                                  target="_blank"
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View on store
                                </Link>
                                <Link
                                  href={`/admin/products/${product.id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-violet-400 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit product
                                </Link>
                                <button
                                  onClick={() => { setOpenMenuId(null); handleToggle(product.id, 'isFeatured', product.isFeatured); }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors disabled:opacity-50"
                                >
                                  <Star className="w-3.5 h-3.5" /> {product.isFeatured ? 'Unfeature' : 'Feature'}
                                </button>
                                <button
                                  onClick={() => { setOpenMenuId(null); handleToggle(product.id, 'isActive', product.isActive ?? true); }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors disabled:opacity-50"
                                >
                                  {(product.isActive ?? true) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  {(product.isActive ?? true) ? 'Deactivate' : 'Activate'}
                                </button>
                                <div className="border-t border-slate-700 mx-2" />
                                <button
                                  onClick={() => { setOpenMenuId(null); handleDelete(product.id, product.name); }}
                                  disabled={actionBusy}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === i + 1 ? 'bg-violet-600 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Product Detail Drawer */}
      {detailProduct && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDetailProduct(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#13151c] border-l border-slate-800 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white line-clamp-1 pr-4">{detailProduct.name}</h2>
              <button onClick={() => setDetailProduct(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Image */}
              {detailProduct.images?.[0]?.url && (
                <div className="w-full h-48 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                  <img src={detailProduct.images[0].url} alt={detailProduct.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${conditionColors[detailProduct.condition] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                  {detailProduct.condition}
                </span>
                {detailProduct.isFeatured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  (detailProduct.isActive ?? true) ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-700 text-slate-400 border border-slate-600'
                }`}>
                  {(detailProduct.isActive ?? true) ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Pricing */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pricing</p>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Selling Price</span><span className="text-white font-semibold">{formatPrice(detailProduct.sellingPrice)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Cost Price</span><span className="text-slate-300">{formatPrice(detailProduct.costPrice)}</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Margin</span>
                  <span className="text-emerald-400 font-medium">
                    {detailProduct.costPrice > 0 ? `${(((detailProduct.sellingPrice - detailProduct.costPrice) / detailProduct.costPrice) * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Stock */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inventory</p>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Total Stock</span>
                  <span className={`font-semibold ${
                    detailProduct.stockQuantity === 0 ? 'text-red-400' :
                    detailProduct.stockQuantity <= (detailProduct.lowStockThreshold ?? 5) ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{detailProduct.stockQuantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Cape Town</span>
                  <span className={`font-medium ${(detailProduct.stockCpt ?? 0) > 0 ? 'text-green-400' : 'text-slate-500'}`}>{detailProduct.stockCpt ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Johannesburg</span>
                  <span className={`font-medium ${(detailProduct.stockJhb ?? 0) > 0 ? 'text-blue-400' : 'text-slate-500'}`}>{detailProduct.stockJhb ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /> Durban</span>
                  <span className={`font-medium ${(detailProduct.stockDbn ?? 0) > 0 ? 'text-orange-400' : 'text-slate-500'}`}>{detailProduct.stockDbn ?? 0}</span>
                </div>
                {detailProduct.sku && <div className="flex justify-between text-sm"><span className="text-slate-400">SKU</span><span className="text-slate-300 font-mono text-xs">{detailProduct.sku}</span></div>}
                {detailProduct.supplierName && <div className="flex justify-between text-sm"><span className="text-slate-400">Supplier</span><span className="text-slate-300">{detailProduct.supplierName}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-slate-400">Category</span><span className="text-slate-300">{detailProduct.category?.name || '—'}</span></div>
              </div>

              {/* Description */}
              {detailProduct.description && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Description</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{detailProduct.description}</p>
                </div>
              )}

              {/* Tags */}
              {detailProduct.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailProduct.tags.map((t: any) => (
                    <span key={t.id || t.tag} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400">{t.tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/admin/products/${detailProduct.id}`} onClick={() => setDetailProduct(null)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
                  <Edit className="w-4 h-4" /> Edit Product
                </Link>
                <Link href={`/products/${detailProduct.slug}`} target="_blank"
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
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
