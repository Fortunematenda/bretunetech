'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, RefreshCw } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { ExportBar } from '@/components/admin/ExportBar';

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Page Views</h1>
            <p className="text-gray-500 text-sm mt-0.5">Which pages are getting the most traffic</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value={1}>Today</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Page Views', value: totalViews, color: 'text-sky-600' },
          { label: 'Avg Pages / Visitor', value: avgPerVisitor, color: 'text-violet-600' },
          { label: 'Most Viewed Page', value: topPage, color: 'text-emerald-600', isText: true },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color} ${(s as any).isText ? 'text-sm truncate' : ''}`}>
              {loading ? '—' : (s as any).isText ? s.value : Number(s.value).toLocaleString()}
            </p>
          </div>
        ))}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">#</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Page URL</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Title</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Views</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Unique Visitors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">No page view data yet</td></tr>
              ) : (
                pages.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 max-w-[250px] truncate font-mono">{p.pageUrl}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px] truncate">{p.pageTitle}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">{p.views}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{p.uniqueVisitors}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
