'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, ShoppingCart, Users, DollarSign, Package, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.getStats(token);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpis = [
    {
      label: 'Total Revenue',
      value: stats ? formatPrice(stats.totalRevenue || 0) : '—',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-500/20',
      change: '+12%',
      up: true,
    },
    {
      label: 'Total Orders',
      value: stats ? String(stats.totalOrders || 0) : '—',
      icon: ShoppingCart,
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-200',
      change: '+8%',
      up: true,
    },
    {
      label: 'Products',
      value: stats ? String(stats.totalProducts || 0) : '—',
      icon: Package,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-500/20',
      change: '+3%',
      up: true,
    },
    {
      label: 'Customers',
      value: stats ? String(stats.totalCustomers || 0) : '—',
      icon: Users,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-500/20',
      change: '+5%',
      up: true,
    },
  ];

  const orderStatusBreakdown = [
    { label: 'Pending', value: stats?.ordersByStatus?.PENDING || 0, color: 'bg-yellow-500', width: 25 },
    { label: 'Processing', value: stats?.ordersByStatus?.PROCESSING || 0, color: 'bg-violet-500', width: 15 },
    { label: 'Shipped', value: stats?.ordersByStatus?.SHIPPED || 0, color: 'bg-sky-500', width: 20 },
    { label: 'Completed', value: stats?.ordersByStatus?.COMPLETED || 0, color: 'bg-emerald-500', width: 30 },
    { label: 'Cancelled', value: stats?.ordersByStatus?.CANCELLED || 0, color: 'bg-red-500', width: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Store performance overview</p>
        </div>
        <button onClick={fetchStats} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`bg-white border rounded-xl p-5 ${kpi.bg}`}>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-7 bg-gray-100 rounded w-1/2 mt-3" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{kpi.label}</p>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change} vs last month
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-600" /> Order Status Breakdown
          </h2>
          <div className="space-y-4">
            {orderStatusBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-900">{loading ? '—' : item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  {!loading && (
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${item.width}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Quick Stats
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex justify-between animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Avg. Order Value', value: stats?.totalOrders > 0 ? formatPrice((stats.totalRevenue || 0) / stats.totalOrders) : '—' },
                { label: 'Low Stock Products', value: String(stats?.lowStockProducts?.length || 0) },
                { label: 'Active Products', value: String(stats?.totalProducts || 0) },
                { label: 'Total Customers', value: String(stats?.totalCustomers || 0) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-200/60 last:border-0">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 p-3 bg-gray-100/50 border border-gray-300/50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Detailed charts and date-range filtering coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
