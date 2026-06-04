'use client';

import { useState, useEffect, useCallback } from 'react';
import { Warehouse, Search, AlertTriangle, RefreshCw, TrendingDown } from 'lucide-react';
import { adminApi, productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, prodData] = await Promise.allSettled([
        token ? adminApi.getInventory(token) : Promise.reject('no token'),
        productsApi.list({ limit: '100' }),
      ]);
      const inv = invData.status === 'fulfilled' && Array.isArray(invData.value) ? invData.value : [];
      const prods = prodData.status === 'fulfilled' ? (prodData.value as any).products || [] : [];
      setItems(inv.length > 0 ? inv : prods);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const lowStockCount = items.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold ?? 5)).length;
  const outOfStockCount = items.filter((p) => p.stockQuantity === 0).length;

  const visible = items.filter((p) => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? (p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold ?? 5)) :
      p.stockQuantity === 0;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Inventory</h1>
          <p className="text-slate-500 text-sm mt-0.5">{items.length} products tracked</p>
        </div>
        <button onClick={fetchInventory} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>{outOfStockCount}</strong> product{outOfStockCount !== 1 ? 's' : ''} out of stock</span>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm text-amber-400">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span><strong>{lowStockCount}</strong> product{lowStockCount !== 1 ? 's' : ''} running low</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Product', 'SKU', 'Stock Level', 'Threshold', 'Cost', 'Sell Price', 'Margin'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Warehouse className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No products match your filter</p>
                  </td>
                </tr>
              ) : (
                visible.map((product) => {
                  const stock = product.stockQuantity ?? 0;
                  const threshold = product.lowStockThreshold ?? 5;
                  const cost = product.costPrice ?? 0;
                  const sell = product.sellingPrice ?? 0;
                  const margin = sell > 0 ? Math.round(((sell - cost) / sell) * 100) : 0;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock <= threshold;
                  const pct = Math.min(100, threshold > 0 ? (stock / (threshold * 4)) * 100 : (stock / 50) * 100);

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                            {product.images?.[0]?.url
                              ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                              : <Warehouse className="w-4 h-4 text-slate-600 m-auto mt-2" />}
                          </div>
                          <span className="text-slate-200 text-sm line-clamp-1 max-w-[180px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{product.sku || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {stock}
                          </span>
                          {isOut && <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/25">OUT</span>}
                          {isLow && <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/25">LOW</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{threshold}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{cost > 0 ? formatPrice(cost) : '—'}</td>
                      <td className="px-5 py-4 text-white font-medium text-sm">{formatPrice(sell)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-semibold ${margin >= 20 ? 'text-emerald-400' : margin >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
