'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { ExportBar } from '@/components/admin/ExportBar';
import { Button } from '@/components/ui/button';
import { analyticsApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

export default function WeeklyVisitsDetailPage() {
  const { token } = useAuthStore();
  const [weekly, setWeekly] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [w, s] = await Promise.allSettled([
        analyticsApi.getWeeklyBreakdown(token),
        analyticsApi.getSummary(token),
      ]);
      if (w.status === 'fulfilled') setWeekly(w.value);
      if (s.status === 'fulfilled') setSummary(s.value);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const visitors = weekly?.visitors || [];
  const pageViews = weekly?.pageViews || [];
  const productViews = weekly?.productViews || [];

  const maxVisitors = Math.max(...visitors.map((v: any) => v.count), 1);
  const maxPageViews = Math.max(...pageViews.map((v: any) => v.count), 1);
  const maxProductViews = Math.max(...productViews.map((v: any) => v.count), 1);

  const peakDay = visitors.length > 0
    ? visitors.reduce((max: any, v: any) => v.count > max.count ? v : max, visitors[0])
    : null;

  const totalWeekVisits = visitors.reduce((s: number, v: any) => s + v.count, 0);

  const exportData = visitors.map((v: any, i: number) => ({
    date: v.date,
    visitors: v.count,
    pageViews: pageViews[i]?.count || 0,
    productViews: productViews[i]?.count || 0,
  }));

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'visitors', label: 'Unique Visitors' },
    { key: 'pageViews', label: 'Page Views' },
    { key: 'productViews', label: 'Product Views' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <AdminPageHeader
            title="Weekly Visits"
            description="7-day traffic breakdown and trends"
            actions={
              <Button type="button" variant="ghost" size="icon" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <AdminKpiCard
          label="Visits This Week"
          value={loading ? '—' : totalWeekVisits.toLocaleString()}
          icon={TrendingUp}
          tone="teal"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Daily Average"
          value={loading ? '—' : (visitors.length > 0 ? Math.round(totalWeekVisits / visitors.length) : 0).toLocaleString()}
          icon={Calendar}
          tone="primary"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Peak Traffic Day"
          value={loading ? '—' : peakDay ? `${new Date(peakDay.date).toLocaleDateString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short' })} (${peakDay.count})` : 'N/A'}
          icon={Calendar}
          tone="emerald"
          loading={loading}
          showArrow={false}
        />
      </div>

      {/* Weekly Visitors Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Weekly Unique Visitors
        </h2>
        {loading ? (
          <div className="h-36 animate-pulse bg-gray-50 rounded-lg" />
        ) : visitors.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No data yet</p>
        ) : (
          <div className="flex items-end gap-2 h-36">
            {visitors.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                <div
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors min-h-[2px]"
                  style={{ height: `${(item.count / maxVisitors) * 100}%` }}
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  {new Date(item.date).toLocaleDateString('en-ZA', { weekday: 'short' })}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count} visitors
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Page Views Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" /> Weekly Page Views
        </h2>
        {loading || pageViews.length === 0 ? (
          <div className="h-28 animate-pulse bg-gray-50 rounded-lg" />
        ) : (
          <div className="flex items-end gap-2 h-28">
            {pageViews.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                <div
                  className="w-full bg-sky-500 rounded-t hover:bg-sky-600 transition-colors min-h-[2px]"
                  style={{ height: `${(item.count / maxPageViews) * 100}%` }}
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  {new Date(item.date).toLocaleDateString('en-ZA', { weekday: 'short' })}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count} page views
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Product Views Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Weekly Product Views
        </h2>
        {loading || productViews.length === 0 ? (
          <div className="h-28 animate-pulse bg-gray-50 rounded-lg" />
        ) : (
          <div className="flex items-end gap-2 h-28">
            {productViews.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                <div
                  className="w-full bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors min-h-[2px]"
                  style={{ height: `${(item.count / maxProductViews) * 100}%` }}
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  {new Date(item.date).toLocaleDateString('en-ZA', { weekday: 'short' })}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count} product views
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Daily Breakdown</h2>
          <ExportBar data={exportData} filename="weekly-visits" columns={exportColumns} />
        </div>
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50">
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Day</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Unique Visitors</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Page Views</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {loading ? (
                <TableRow><TableCell colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</TableCell></TableRow>
              ) : visitors.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">No data yet</TableCell></TableRow>
              ) : (
                visitors.map((v: any, i: number) => (
                  <TableRow key={i} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 font-medium">
                      {new Date(v.date).toLocaleDateString('en-ZA', { weekday: 'long', day: '2-digit', month: 'short' })}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-indigo-600">{v.count}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-sky-600">{pageViews[i]?.count || 0}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-emerald-600">{productViews[i]?.count || 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
