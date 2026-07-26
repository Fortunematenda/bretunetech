'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, RefreshCw, BarChart3, FileText } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { ExportBar } from '@/components/admin/ExportBar';
import { Button } from '@/components/ui/button';
import { analyticsApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

export default function PageViewsDetailPage() {
  const { token } = useAuthStore();
  const [pages, setPages] = useState<any[]>([]);
  const [visitorsOverTime, setVisitorsOverTime] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [p, s, vot] = await Promise.allSettled([
        analyticsApi.getDetailedPageViews(token, days),
        analyticsApi.getSummary(token),
        analyticsApi.getVisitorsOverTime(token, days),
      ]);
      if (p.status === 'fulfilled') setPages(p.value);
      if (s.status === 'fulfilled') setSummary(s.value);
      if (vot.status === 'fulfilled') setVisitorsOverTime(vot.value);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalViews = pages.reduce((s, p) => s + p.views, 0);
  const avgPerVisitor = summary?.uniqueVisitorsToday > 0 ? (summary.pageViewsToday / summary.uniqueVisitorsToday).toFixed(1) : '0';
  const topPage = pages[0]?.pageUrl || 'N/A';
  const maxDaily = Math.max(...visitorsOverTime.map(v => v.count), 1);

  const exportColumns = [
    { key: 'pageUrl', label: 'Page URL' },
    { key: 'pageTitle', label: 'Page Title' },
    { key: 'views', label: 'Views' },
    { key: 'uniqueVisitors', label: 'Unique Visitors' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <AdminPageHeader
            title="Page Views"
            description="Which pages are getting the most traffic"
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
          label="Total Page Views"
          value={loading ? '—' : totalViews.toLocaleString()}
          icon={Eye}
          tone="sky"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Avg Pages / Visitor"
          value={loading ? '—' : Number(avgPerVisitor).toLocaleString()}
          icon={BarChart3}
          tone="primary"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Most Viewed Page"
          value={loading ? '—' : topPage}
          icon={FileText}
          tone="emerald"
          loading={loading}
          showArrow={false}
        />
      </div>

      {/* Page Views by Day Chart */}
      {visitorsOverTime.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Page Views by Day</h2>
          <div className="flex items-end gap-1 h-32">
            {visitorsOverTime.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-sky-500 rounded-t-sm hover:bg-sky-600 transition-colors min-h-[1px]"
                  style={{ height: `${(item.count / maxDaily) * 100}%` }}
                />
                <span className="text-[9px] text-gray-400 hidden lg:block">
                  {new Date(item.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                </span>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Top Pages</h2>
          <ExportBar data={pages} filename="page-views" columns={exportColumns} />
        </div>
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50">
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">#</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Page URL</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Title</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Views</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Unique Visitors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {loading ? (
                <TableRow><TableCell colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</TableCell></TableRow>
              ) : pages.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">No page view data yet</TableCell></TableRow>
              ) : (
                pages.map((p, i) => (
                  <TableRow key={i} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 max-w-[250px] truncate font-mono">{p.pageUrl}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px] truncate">{p.pageTitle}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-gray-900">{p.views}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{p.uniqueVisitors}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
