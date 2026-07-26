'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Users, Eye, Globe, Monitor,
  Smartphone, Tablet, RefreshCw, ExternalLink, Clock, Zap,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import VisitorTrendChart from '@/components/admin/VisitorTrendChart';
import { Button } from '@/components/ui/button';
import { analyticsApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

export default function AdminAnalyticsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [liveCount, setLiveCount] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [trafficSources, setTrafficSources] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [browsers, setBrowsers] = useState<any[]>([]);
  const [customerSummary, setCustomerSummary] = useState<any>(null);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, tp, tpr, ts, d, b, cs, rc] = await Promise.allSettled([
        analyticsApi.getSummary(token),
        analyticsApi.getTopPages(token, days),
        analyticsApi.getTopProducts(token, days),
        analyticsApi.getTrafficSources(token, days),
        analyticsApi.getDeviceBreakdown(token, days),
        analyticsApi.getBrowsers(token, days),
        analyticsApi.getCustomerSummary(token),
        analyticsApi.getRecentCustomers(token, 10),
      ]);
      if (s.status === 'fulfilled') setSummary(s.value);
      if (tp.status === 'fulfilled') setTopPages(tp.value);
      if (tpr.status === 'fulfilled') setTopProducts(tpr.value);
      if (ts.status === 'fulfilled') setTrafficSources(ts.value);
      if (d.status === 'fulfilled') setDevices(d.value);
      if (b.status === 'fulfilled') setBrowsers(b.value);
      if (cs.status === 'fulfilled') setCustomerSummary(cs.value);
      if (rc.status === 'fulfilled') setRecentCustomers(rc.value);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh live visitors every 10 seconds
  useEffect(() => {
    if (!token) return;
    const fetchLive = () => {
      analyticsApi.getLiveVisitors(token).then(d => setLiveCount(d?.count || 0)).catch(() => {});
    };
    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const deviceIcons: Record<string, any> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Website Analytics"
        description="Traffic and visitor insights"
        actions={
          <>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <Button type="button" variant="ghost" size="icon" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* Live Visitors Badge */}
      {liveCount > 0 && (
        <div
          onClick={() => router.push('/admin/analytics/visitors')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl w-fit cursor-pointer hover:bg-emerald-100 transition-colors"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700">{liveCount} live visitor{liveCount !== 1 ? 's' : ''} now</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminKpiCard
          label="Visitors Today"
          value={loading ? '—' : (summary?.visitsToday || 0).toLocaleString()}
          icon={Users}
          tone="primary"
          href="/admin/analytics/visitors"
          loading={loading}
        />
        <AdminKpiCard
          label="Page Views"
          value={loading ? '—' : (summary?.pageViewsToday || 0).toLocaleString()}
          icon={Eye}
          tone="sky"
          href="/admin/analytics/page-views"
          loading={loading}
        />
        <AdminKpiCard
          label="Product Views"
          value={loading ? '—' : (summary?.productViewsToday || 0).toLocaleString()}
          icon={BarChart3}
          tone="emerald"
          href="/admin/analytics/product-views"
          loading={loading}
        />
        <AdminKpiCard
          label="Unique Visitors"
          value={loading ? '—' : (summary?.uniqueVisitorsToday || 0).toLocaleString()}
          icon={Globe}
          tone="amber"
          href="/admin/analytics/unique-visitors"
          loading={loading}
        />
        <AdminKpiCard
          label="New Customers"
          value={loading ? '—' : (customerSummary?.newToday || 0).toLocaleString()}
          icon={Users}
          tone="rose"
          href="/admin/customers/new"
          loading={loading}
        />
        <AdminKpiCard
          label="Weekly Visits"
          value={loading ? '—' : (summary?.visitsWeek || 0).toLocaleString()}
          icon={TrendingUp}
          tone="teal"
          href="/admin/analytics/weekly-visits"
          loading={loading}
        />
      </div>

      <VisitorTrendChart token={token} title="Visitor Trend" defaultDays={7} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-sky-600" /> Top Pages
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" />)}
              </div>
            ) : topPages.length === 0 ? (
              <p className="p-5 text-center text-gray-400 text-sm">No data yet</p>
            ) : (
              topPages.slice(0, 10).map((page, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-gray-700 truncate max-w-[250px]">{page.pageUrl}</span>
                  <span className="text-xs font-semibold text-gray-900 shrink-0 ml-3">{page.views}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" /> Most Viewed Products
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" />)}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="p-5 text-center text-gray-400 text-sm">No data yet</p>
            ) : (
              topProducts.slice(0, 10).map((product, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 truncate max-w-[200px]">{product.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{product.sku}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 shrink-0 ml-3">{product.views} views</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" /> Devices
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" />)}
            </div>
          ) : devices.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No data</p>
          ) : (
            <div className="space-y-3">
              {devices.map((d, i) => {
                const Icon = deviceIcons[d.device] || Monitor;
                const total = devices.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 capitalize">{d.device}</span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browser Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" /> Browsers
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" />)}
            </div>
          ) : browsers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No data</p>
          ) : (
            <div className="space-y-3">
              {browsers.map((b, i) => {
                const total = browsers.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-gray-700">{b.browser}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-700" /> Traffic Sources
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" />)}
            </div>
          ) : trafficSources.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No referrer data yet</p>
          ) : (
            <div className="space-y-2">
              {trafficSources.slice(0, 8).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-700 truncate max-w-[150px]">{s.source || 'Direct'}</span>
                  <span className="text-xs font-semibold text-gray-900">{s.visits}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-600" /> Customer Stats
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'New Today', value: customerSummary?.newToday || 0 },
                { label: 'New This Week', value: customerSummary?.newThisWeek || 0 },
                { label: 'New This Month', value: customerSummary?.newThisMonth || 0 },
                { label: 'Total Customers', value: customerSummary?.totalCustomers || 0 },
                { label: 'With Orders', value: customerSummary?.customersWithOrders || 0 },
                { label: 'Without Orders', value: customerSummary?.customersWithoutOrders || 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className="text-xs font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-600" /> Recent Registrations
            </h2>
          </div>
          <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100">
                  <TableHead className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Name</TableHead>
                  <TableHead className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Email</TableHead>
                  <TableHead className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Orders</TableHead>
                  <TableHead className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Spend</TableHead>
                  <TableHead className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">Loading...</TableCell></TableRow>
                ) : recentCustomers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">No customers yet</TableCell></TableRow>
                ) : (
                  recentCustomers.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50/50">
                      <TableCell className="px-5 py-2.5 text-xs text-gray-700">{c.firstName} {c.lastName}</TableCell>
                      <TableCell className="px-5 py-2.5 text-xs text-gray-500">{c.email}</TableCell>
                      <TableCell className="px-5 py-2.5 text-xs text-gray-700">{c.orderCount}</TableCell>
                      <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-900">R {c.totalSpend.toFixed(2)}</TableCell>
                      <TableCell className="px-5 py-2.5 text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
