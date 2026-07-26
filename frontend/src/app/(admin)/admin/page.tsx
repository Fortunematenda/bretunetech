'use client';
/* ─── BretuneTech Admin — Dashboard ─────────────────────────────────────── */

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminKpiCard from '@/components/admin/AdminKpiCard';

export default function AdminPage() {
  const router = useRouter();
  const { user, token, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — BretuneTech Admin';
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
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Loading...</h1>
        <p className="text-gray-500 text-sm">Please wait while we load your session.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-primary" />
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
        <Link href="/" className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors">
          Go to Store
        </Link>
      </div>
    );
  }

  const featuredProducts = products.filter((p: any) => p.isFeatured);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Dashboard"
        description="Welcome back — here's what's happening today."
        actions={
          <>
            <Button type="button" variant="outline" size="icon" onClick={() => fetchAll()} title="Refresh" className="text-gray-700">
              <RefreshCw className="h-4 w-4 text-gray-700" />
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/products/new">
                <Plus data-icon="inline-start" className="h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          </>
        }
      />

      {/* ─── KPI Cards ─────────────────────────────────── */}
      {loading || !stats ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AdminKpiCard
            label="Revenue"
            value={formatPrice(stats.totalRevenue || 0)}
            sub="All time"
            icon={DollarSign}
            tone="emerald"
            href="/admin/orders"
          />
          <AdminKpiCard
            label="Orders"
            value={String(stats.totalOrders || 0)}
            sub="All orders"
            icon={ShoppingCart}
            tone="primary"
            href="/admin/orders"
          />
          <AdminKpiCard
            label="Visitors"
            value={String(analyticsSummary?.visitsToday || 0)}
            sub={`${analyticsSummary?.uniqueVisitorsToday || 0} unique today`}
            icon={Eye}
            tone="sky"
            href="/admin/analytics/visitors"
          />
          <AdminKpiCard
            label="Customers"
            value={String(customerSummary?.totalCustomers || stats.totalCustomers || 0)}
            sub={`+${customerSummary?.newToday || 0} today`}
            icon={Users}
            tone="rose"
            href="/admin/customers"
          />
        </div>
      )}

      {/* ─── Quick Actions ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: 'Add Product', hint: 'Create listing', href: '/admin/products/new', icon: Package, accent: 'bg-primary text-white' },
          { label: 'View Orders', hint: 'Fulfillment', href: '/admin/orders', icon: ShoppingCart, accent: 'bg-sky-500 text-white' },
          { label: 'Import CSV', hint: 'Bulk upload', href: '/admin/import', icon: Upload, accent: 'bg-amber-500 text-white' },
          { label: 'Inventory', hint: 'Stock levels', href: '/admin/inventory', icon: Warehouse, accent: 'bg-emerald-600 text-white' },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ${a.accent}`}>
              <a.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 group-hover:text-primary">{a.label}</span>
              <span className="block text-[11px] text-gray-500">{a.hint}</span>
            </span>
            <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>

      {/* ─── Featured Products (card grid) ─────────────── */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4 sm:px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Featured Products
            {featuredProducts.length > 0 && (
              <Badge variant="secondary" className="rounded-full bg-emerald-50 text-[10px] text-emerald-700">
                {featuredProducts.length}
              </Badge>
            )}
          </CardTitle>
          <Link href="/admin/products?featured=true" className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-emerald-600">
            Manage <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        {featuredProducts.length === 0 ? (
          <div className="relative overflow-hidden px-5 py-10 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,61,122,0.06),transparent_55%)]" />
            <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-primary/10">
              <Package className="h-6 w-6 text-primary/50" />
            </div>
            <p className="relative text-sm font-medium text-gray-700">No featured products yet</p>
            <p className="relative mt-1 text-xs text-gray-500">Star products to highlight them on the storefront</p>
            <Button asChild size="sm" variant="outline" className="relative mt-4">
              <Link href="/admin/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: card grid */}
            <div className="grid grid-cols-2 gap-2 p-3 lg:hidden" style={{gridTemplateColumns: '1fr 1fr'}}>
              {featuredProducts.slice(0, 10).map((item: any) => (
                <Link key={item.id} href={`/admin/products/${item.id}`}
                  className="group bg-gray-50 border border-gray-100 hover:border-primary/20 hover:shadow-md rounded-xl overflow-hidden transition-all duration-200">
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
            <div className="hidden lg:block divide-y divide-gray-100/40">
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
      </Card>

      {/* ─── Main content grid ─────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Recent Orders */}
        <Card className="overflow-hidden py-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4 sm:px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4 text-primary" /> Recent Orders
            </CardTitle>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 text-[10px] uppercase tracking-wider sm:px-5">Order</TableHead>
                  <TableHead className="px-4 text-[10px] uppercase tracking-wider sm:px-5">Customer</TableHead>
                  <TableHead className="px-4 text-[10px] uppercase tracking-wider sm:px-5">Total</TableHead>
                  <TableHead className="px-4 text-[10px] uppercase tracking-wider sm:px-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.recentOrders || orders).slice(0, 6).map((order: any) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <TableCell className="px-4 font-mono text-xs font-semibold text-primary sm:px-5">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="px-4 sm:px-5">
                      <p className="text-xs font-medium">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="max-w-[120px] truncate text-[10px] text-muted-foreground">
                        {order.user?.email}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 text-xs font-bold sm:px-5">
                      {formatPrice(order.totalPrice || 0)}
                    </TableCell>
                    <TableCell className="px-4 sm:px-5">
                      <AdminStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {!orders.length && !stats?.recentOrders?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="overflow-hidden py-0">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4 sm:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock
              </CardTitle>
              <Link href="/admin/inventory" className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-amber-600">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {(stats?.lowStockProducts || inventory.filter((p: any) => p.stockQuantity <= 5)).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{item.sku || '—'}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`ml-3 shrink-0 text-[10px] font-bold ${
                      (item.stockQuantity ?? 0) === 0
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {(item.stockQuantity ?? 0) === 0 ? 'Out of stock' : `${item.stockQuantity} left`}
                  </Badge>
                </div>
              ))}
              {!(stats?.lowStockProducts?.length) && !inventory.filter((p: any) => p.stockQuantity <= 5).length && (
                <p className="px-5 py-6 text-center text-xs text-muted-foreground">All products well-stocked ✓</p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden py-0">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4 sm:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <UserPlus className="h-4 w-4 text-pink-500" /> New Customers
              </CardTitle>
              <Link href="/admin/customers" className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-pink-600">
                All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {recentCustomers.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary">
                    <span className="text-[10px] font-bold text-white">
                      {(c.firstName?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">{c.email}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
              {recentCustomers.length === 0 && (
                <p className="px-5 py-6 text-center text-xs text-muted-foreground">No customers yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

