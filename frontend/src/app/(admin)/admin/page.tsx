'use client';
/* ─── Bretunetech Admin — Dashboard ─────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, ShoppingCart, Users, DollarSign, AlertTriangle,
  Plus, TrendingUp, ArrowUpRight, RefreshCw, Upload, Warehouse,
  Eye, UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { adminApi, productsApi, analyticsApi } from '@/lib/api';
import { StatCardSkeleton } from '@/components/ui/Skeleton';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-700',
  PAID: 'bg-blue-50 text-blue-600',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  SHIPPED: 'bg-cyan-50 text-cyan-600',
  COMPLETED: 'bg-green-500/20 text-green-600',
  CANCELLED: 'bg-red-50 text-red-600',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — Bretunetech Admin';
  }, []);

  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [customerSummary, setCustomerSummary] = useState<any>(null);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsData, productsData, ordersData, inventoryData, analyticsData, customerData, recentCustData] = await Promise.allSettled([
        adminApi.getStats(token),
        productsApi.list({ limit: '100' }),
        adminApi.getOrders(token, { limit: '20' }),
        adminApi.getInventory(token),
        analyticsApi.getSummary(token),
        analyticsApi.getCustomerSummary(token),
        analyticsApi.getRecentCustomers(token, 5),
      ]);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (productsData.status === 'fulfilled') setProducts((productsData.value as any).products || []);
      if (ordersData.status === 'fulfilled') setOrders((ordersData.value as any).orders || []);
      if (inventoryData.status === 'fulfilled') setInventory(Array.isArray(inventoryData.value) ? inventoryData.value : []);
      if (analyticsData.status === 'fulfilled') setAnalyticsSummary(analyticsData.value);
      if (customerData.status === 'fulfilled') setCustomerSummary(customerData.value);
      if (recentCustData.status === 'fulfilled') setRecentCustomers(recentCustData.value);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Not logged in - redirect to admin login
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/admin-login');
    }
  }, [user, router, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="w-full py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Loading...</h1>
        <p className="text-gray-500 text-sm">Please wait while we load your session.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Redirecting to login...</h1>
        <p className="text-gray-500 text-sm">Please wait while we redirect you to the admin login.</p>
      </div>
    );
  }

  // Logged in but not admin
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="w-full py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6 text-sm">You need admin privileges to access this area.</p>
        <Link href="/" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
          Go to Store
        </Link>
      </div>
    );
  }

  const featuredProducts = products.filter((p: any) => p.isFeatured);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => fetchAll()} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/products/new" className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards ─────────────────────────────────── */}
      {loading || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Revenue', value: formatPrice(stats.totalRevenue || 0), sub: 'All time', icon: DollarSign, accent: 'text-emerald-600', iconBg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500', href: '/admin/orders' },
            { label: 'Orders', value: String(stats.totalOrders || 0), sub: 'All orders', icon: ShoppingCart, accent: 'text-violet-600', iconBg: 'bg-violet-50', border: 'border-violet-100', dot: 'bg-violet-500', href: '/admin/orders' },
            { label: 'Visitors', value: String(analyticsSummary?.visitsToday || 0), sub: `${analyticsSummary?.uniqueVisitorsToday || 0} unique today`, icon: Eye, accent: 'text-sky-600', iconBg: 'bg-sky-50', border: 'border-sky-100', dot: 'bg-sky-500', href: '/admin/analytics/visitors' },
            { label: 'Customers', value: String(customerSummary?.totalCustomers || stats.totalCustomers || 0), sub: `+${customerSummary?.newToday || 0} today`, icon: Users, accent: 'text-pink-600', iconBg: 'bg-pink-50', border: 'border-pink-100', dot: 'bg-pink-500', href: '/admin/customers' },
          ].map((s) => (
            <div key={s.label} onClick={() => router.push(s.href)}
              className={`bg-white border ${s.border} rounded-xl p-4 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 text-gray-300 group-hover:${s.accent} transition-colors`} />
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${s.accent} leading-tight`}>{s.value}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Quick Actions ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Add Product', href: '/admin/products/new', icon: Package, color: 'text-violet-600', bg: 'hover:bg-violet-50 hover:border-violet-200' },
          { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, color: 'text-sky-600', bg: 'hover:bg-sky-50 hover:border-sky-200' },
          { label: 'Import CSV', href: '/admin/import', icon: Upload, color: 'text-amber-600', bg: 'hover:bg-amber-50 hover:border-amber-200' },
          { label: 'Inventory', href: '/admin/inventory', icon: Warehouse, color: 'text-emerald-600', bg: 'hover:bg-emerald-50 hover:border-emerald-200' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 transition-all ${a.bg}`}
          >
            <a.icon className={`w-4 h-4 shrink-0 ${a.color}`} />
            {a.label}
          </Link>
        ))}
      </div>

      {/* ─── Featured Products (card grid) ─────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Featured Products
            {featuredProducts.length > 0 && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">{featuredProducts.length}</span>
            )}
          </h2>
          <Link href="/admin/products?featured=true" className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 transition-colors">
            Manage <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">No featured products yet</p>
          </div>
        ) : (
          <>
            {/* Mobile: card grid */}
            <div className="grid grid-cols-2 gap-3 p-3 sm:hidden">
              {featuredProducts.slice(0, 10).map((item: any) => (
                <Link key={item.id} href={`/admin/products/${item.id}`}
                  className="group bg-gray-50 border border-gray-100 hover:border-violet-200 hover:shadow-md rounded-xl overflow-hidden transition-all duration-200">
                  <div className="relative aspect-square bg-white overflow-hidden">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-200" />
                      </div>
                    )}
                    <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      (item.stockQuantity ?? 0) === 0 ? 'bg-red-500 text-white'
                      : (item.stockQuantity ?? 0) <= 5 ? 'bg-amber-400 text-white'
                      : 'bg-emerald-500 text-white'
                    }`}>
                      {(item.stockQuantity ?? 0) === 0 ? 'Out' : `${item.stockQuantity}`}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-snug mb-1">{item.name}</p>
                    <p className="text-xs font-bold text-emerald-600">{formatPrice(item.sellingPrice)}</p>
                    {item.originalPrice && <p className="text-[10px] text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>}
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: original compact list */}
            <div className="hidden sm:block divide-y divide-gray-100/40">
              {featuredProducts.slice(0, 5).map((item: any, idx: number) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-[11px] text-gray-700 w-4 shrink-0">#{idx + 1}</span>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-300">
                    {item.images?.[0]?.url
                      ? <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
                      : <Package className="w-4 h-4 text-gray-600 m-auto mt-2" />}
                  </div>
                  <p className="text-xs text-gray-700 flex-1 truncate">{item.name}</p>
                  <span className="text-xs font-semibold text-emerald-600 shrink-0">{formatPrice(item.sellingPrice)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Main content grid ─────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-violet-600" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] text-gray-400 font-semibold px-4 sm:px-5 py-3 uppercase tracking-wider">Order</th>
                  <th className="text-left text-[10px] text-gray-400 font-semibold px-4 sm:px-5 py-3 uppercase tracking-wider">Customer</th>
                  <th className="text-left text-[10px] text-gray-400 font-semibold px-4 sm:px-5 py-3 uppercase tracking-wider">Total</th>
                  <th className="text-left text-[10px] text-gray-400 font-semibold px-4 sm:px-5 py-3 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentOrders || orders).slice(0, 6).map((order: any) => (
                  <tr key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:bg-gray-50/80 transition-colors cursor-pointer">
                    <td className="px-4 sm:px-5 py-3 font-mono text-xs text-violet-700 font-semibold">{order.orderNumber}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <p className="text-xs font-medium text-gray-800">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{order.user?.email}</p>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-xs font-bold text-gray-900 whitespace-nowrap">{formatPrice(order.totalPrice || 0)}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!orders.length && !stats?.recentOrders?.length && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Low Stock */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock
              </h2>
              <Link href="/admin/inventory" className="text-xs text-gray-500 hover:text-amber-600 flex items-center gap-1 transition-colors">
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats?.lowStockProducts || inventory.filter((p: any) => p.stockQuantity <= 5)).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku || '—'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ml-3 ${
                    (item.stockQuantity ?? 0) === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {(item.stockQuantity ?? 0) === 0 ? 'Out of stock' : `${item.stockQuantity} left`}
                  </span>
                </div>
              ))}
              {!(stats?.lowStockProducts?.length) && !inventory.filter((p: any) => p.stockQuantity <= 5).length && (
                <p className="px-5 py-6 text-center text-gray-400 text-xs">All products well-stocked ✓</p>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-500" /> New Customers
              </h2>
              <Link href="/admin/customers" className="text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1 transition-colors">
                All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentCustomers.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{(c.firstName?.[0] || '?').toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
              {recentCustomers.length === 0 && (
                <p className="px-5 py-6 text-center text-gray-400 text-xs">No customers yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

