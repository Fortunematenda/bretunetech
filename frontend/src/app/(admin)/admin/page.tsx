'use client';
/* ─── Bretunetech Admin — Dashboard ─────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, ShoppingCart, Users, DollarSign, AlertTriangle,
  Plus, TrendingUp, ArrowUpRight, RefreshCw, Upload, Warehouse,
  Eye, Globe, UserPlus,
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAll()}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards ─────────────────────────────────── */}
      {loading || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), sub: 'All time', icon: DollarSign, accent: 'text-emerald-600', bg: 'bg-emerald-500/8 border-emerald-500/15', dot: 'bg-emerald-500', href: '/admin/orders' },
            { label: 'Total Orders', value: String(stats.totalOrders || 0), sub: 'All orders', icon: ShoppingCart, accent: 'text-violet-600', bg: 'bg-violet-500/8 border-violet-500/15', dot: 'bg-violet-500', href: '/admin/orders' },
            { label: 'Visitors Today', value: String(analyticsSummary?.visitsToday || 0), sub: `${analyticsSummary?.uniqueVisitorsToday || 0} unique`, icon: Eye, accent: 'text-sky-600', bg: 'bg-sky-500/8 border-sky-500/15', dot: 'bg-sky-500', href: '/admin/analytics/visitors' },
            { label: 'New Customers', value: String(customerSummary?.newToday || 0), sub: `${customerSummary?.totalCustomers || stats.totalCustomers || 0} total`, icon: UserPlus, accent: 'text-pink-600', bg: 'bg-pink-500/8 border-pink-500/15', dot: 'bg-pink-500', href: '/admin/customers/new' },
          ].map((s) => (
            <div key={s.label} onClick={() => router.push(s.href)} className={`bg-white border rounded-xl p-5 ${s.bg} cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.accent}`}>{s.value}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${s.bg} border flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.accent}`} />
                </div>
              </div>
              <div className={`h-0.5 w-12 rounded-full ${s.dot}`} />
            </div>
          ))}
        </div>
      )}

      {/* ─── Quick Actions ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Product', href: '/admin/products/new', icon: Package, color: 'text-violet-600', bg: 'hover:bg-violet-50 hover:border-violet-200' },
          { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, color: 'text-sky-600', bg: 'hover:bg-sky-50 hover:border-sky-500/30' },
          { label: 'Import CSV', href: '/admin/import', icon: Upload, color: 'text-amber-700', bg: 'hover:bg-amber-50 hover:border-amber-200' },
          { label: 'Inventory', href: '/admin/inventory', icon: Warehouse, color: 'text-emerald-600', bg: 'hover:bg-emerald-50 hover:border-emerald-200' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className={`flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all ${a.bg}`}
          >
            <a.icon className={`w-4 h-4 shrink-0 ${a.color}`} />
            {a.label}
          </Link>
        ))}
      </div>

      {/* ─── Main content grid ─────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-violet-600" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200/60">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Order</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Customer</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Total</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/40">
                {(stats?.recentOrders || orders).slice(0, 6).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700 text-xs">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-gray-600 text-[11px]">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatPrice(order.totalPrice || 0)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-700 text-gray-500'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!orders.length && !stats?.recentOrders?.length && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-600 text-sm">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Low Stock */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" /> Low Stock
              </h2>
              <Link href="/admin/inventory" className="text-xs text-gray-500 hover:text-amber-700 flex items-center gap-1 transition-colors">
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100/40">
              {(stats?.lowStockProducts || inventory.filter((p: any) => p.stockQuantity <= 5)).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 truncate max-w-[140px]">{item.name}</p>
                    <p className="text-[11px] text-gray-600 font-mono">{item.sku || '—'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    (item.stockQuantity ?? 0) === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.stockQuantity ?? 0} left
                  </span>
                </div>
              ))}
              {!(stats?.lowStockProducts?.length) && !inventory.filter((p: any) => p.stockQuantity <= 5).length && (
                <p className="px-5 py-6 text-center text-gray-600 text-xs">All products well-stocked ✓</p>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-600" /> New Customers
              </h2>
              <Link href="/admin/customers" className="text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1 transition-colors">
                All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100/40">
              {recentCustomers.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-[11px] text-gray-500">{c.email}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                    {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
              {recentCustomers.length === 0 && (
                <p className="px-5 py-6 text-center text-gray-600 text-xs">No customers yet</p>
              )}
            </div>
          </div>

          {/* Most Viewed Products */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Featured Products
              </h2>
              <Link href="/admin/products" className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100/40">
              {products.filter((p: any) => p.isFeatured).slice(0, 5).map((item: any, idx: number) => (
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
              {products.filter((p: any) => p.isFeatured).length === 0 && (
                <p className="px-5 py-6 text-center text-gray-600 text-xs">No featured products</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

