'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Package, RefreshCw, ExternalLink, Pencil, BarChart3, TrendingDown } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { ExportBar } from '@/components/admin/ExportBar';
import { Button } from '@/components/ui/button';
import { analyticsApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

export default function ProductViewsDetailPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await analyticsApi.getDetailedProductViews(token, days);
      setProducts(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalViews = products.reduce((s, p) => s + p.views, 0);
  const mostViewed = products[0]?.name || 'N/A';
  const leastViewed = products.length > 0 ? products[products.length - 1]?.name : 'N/A';

  const exportColumns = [
    { key: 'name', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'views', label: 'Views' },
    { key: 'viewsToday', label: 'Views Today' },
    { key: 'viewsWeek', label: 'Views This Week' },
    { key: 'orders', label: 'Orders' },
    { key: 'conversionRate', label: 'Conversion Rate (%)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <AdminPageHeader
            title="Product Views"
            description="Product popularity and conversion analytics"
            actions={
              <>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value={1}>Today</option>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                </select>
                <Button type="button" variant="ghost" size="icon" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <AdminKpiCard
          label="Total Product Views"
          value={loading ? '—' : totalViews.toLocaleString()}
          icon={BarChart3}
          tone="emerald"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Most Viewed"
          value={loading ? '—' : mostViewed}
          icon={Package}
          tone="primary"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Least Viewed"
          value={loading ? '—' : leastViewed}
          icon={TrendingDown}
          tone="slate"
          loading={loading}
          showArrow={false}
        />
      </div>

      {/* Product Popularity Chart */}
      {products.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Product Popularity</h2>
          <div className="space-y-2">
            {products.slice(0, 10).map((p, i) => {
              const pct = totalViews > 0 ? (p.views / totalViews) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-400 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 truncate max-w-[200px]">{p.name}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{p.views} views</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">All Product Views</h2>
          <ExportBar data={products} filename="product-views" columns={exportColumns} />
        </div>
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50">
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">SKU</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Views</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Today</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">This Week</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Orders</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Conv. Rate</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {loading ? (
                <TableRow><TableCell colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">No product view data yet</TableCell></TableRow>
              ) : (
                products.map((p, i) => (
                  <TableRow key={i} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 max-w-[180px] truncate">{p.name}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500 font-mono">{p.sku || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-gray-900">{p.views}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{p.viewsToday}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{p.viewsWeek}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{p.orders}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs">
                      <span className={`font-semibold ${Number(p.conversionRate) > 5 ? 'text-emerald-600' : Number(p.conversionRate) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {p.conversionRate}%
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        {p.slug && (
                          <Link href={`/products/${p.slug}`} target="_blank" className="p-1 text-gray-400 hover:text-sky-600 rounded transition-colors" title="View Product">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {p.productId && (
                          <Link href={`/admin/products/${p.productId}`} className="p-1 text-gray-400 hover:text-primary rounded transition-colors" title="Edit Product">
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
