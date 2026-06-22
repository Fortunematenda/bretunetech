'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Users, Eye, Globe, Monitor,
  Smartphone, Tablet, RefreshCw, ExternalLink, Clock, Zap,
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
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
  const [visitorsOverTime, setVisitorsOverTime] = useState<any[]>([]);
  const [customerSummary, setCustomerSummary] = useState<any>(null);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, tp, tpr, ts, d, b, vot, cs, rc] = await Promise.allSettled([
        analyticsApi.getSummary(token),
        analyticsApi.getTopPages(token, days),
        analyticsApi.getTopProducts(token, days),
        analyticsApi.getTrafficSources(token, days),
        analyticsApi.getDeviceBreakdown(token, days),
        analyticsApi.getBrowsers(token, days),
        analyticsApi.getVisitorsOverTime(token, days),
        analyticsApi.getCustomerSummary(token),
        analyticsApi.getRecentCustomers(token, 10),
      ]);
      if (s.status === 'fulfilled') setSummary(s.value);
      if (tp.status === 'fulfilled') setTopPages(tp.value);
      if (tpr.status === 'fulfilled') setTopProducts(tpr.value);
      if (ts.status === 'fulfilled') setTrafficSources(ts.value);
      if (d.status === 'fulfilled') setDevices(d.value);
      if (b.status === 'fulfilled') setBrowsers(b.value);
      if (vot.status === 'fulfilled') setVisitorsOverTime(vot.value);
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

  const maxVisitors = Math.max(...(visitorsOverTime.map(v => v.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Website Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Traffic and visitor insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button onClick={fetchAll} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Visitors Badge */}
      {liveCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700">{liveCount} live visitor{liveCount !== 1 ? 's' : ''} now</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Visitors Today', value: summary?.visitsToday || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', href: '/admin/analytics/visitors' },
          { label: 'Page Views', value: summary?.pageViewsToday || 0, icon: Eye, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', href: '/admin/analytics/page-views' },
          { label: 'Product Views', value: summary?.productViewsToday || 0, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', href: '/admin/analytics/product-views' },
          { label: 'Unique Visitors', value: summary?.uniqueVisitorsToday || 0, icon: Globe, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', href: '/admin/analytics/unique-visitors' },
          { label: 'New Customers', value: customerSummary?.newToday || 0, icon: Users, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', href: '/admin/customers/new' },
          { label: 'Weekly Visits', value: summary?.visitsWeek || 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', href: '/admin/analytics/weekly-visits' },
        ].map((card) => (
          <div
            key={card.label}
            onClick={() => router.push(card.href)}
            className={`bg-white border rounded-xl p-4 ${card.bg} cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
          >
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-6 bg-gray-100 rounded w-1/2 mt-2" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{card.label}</p>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className={`text-xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Visitors Over Time Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-600" /> Visitors Over Time
        </h2>
        {loading ? (
          <div className="h-40 animate-pulse bg-gray-50 rounded-lg" />
        ) : visitorsOverTime.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No data yet. Visits will appear here once tracked.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {visitorsOverTime.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-violet-500 rounded-t-sm hover:bg-violet-600 transition-colors min-h-[2px]"
                  style={{ height: `${(item.count / maxVisitors) * 100}%` }}
                />
                <span className="text-[9px] text-gray-400 hidden lg:block">
                  {new Date(item.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count} visits
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <Monitor className="w-4 h-4 text-violet-600" /> Devices
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
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Name</th>
                  <th className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Email</th>
                  <th className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Orders</th>
                  <th className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Spend</th>
                  <th className="text-left text-[11px] text-gray-500 font-medium px-5 py-2.5 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">Loading...</td></tr>
                ) : recentCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">No customers yet</td></tr>
                ) : (
                  recentCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-2.5 text-xs text-gray-700">{c.firstName} {c.lastName}</td>
                      <td className="px-5 py-2.5 text-xs text-gray-500">{c.email}</td>
                      <td className="px-5 py-2.5 text-xs text-gray-700">{c.orderCount}</td>
                      <td className="px-5 py-2.5 text-xs font-semibold text-gray-900">R {c.totalSpend.toFixed(2)}</td>
                      <td className="px-5 py-2.5 text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
