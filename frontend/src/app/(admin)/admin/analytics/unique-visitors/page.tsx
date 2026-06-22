'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Globe, RefreshCw, Users, X } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { ExportBar } from '@/components/admin/ExportBar';

export default function UniqueVisitorsDetailPage() {
  const { token } = useAuthStore();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [newVsReturning, setNewVsReturning] = useState<any>(null);
  const [visitorsOverTime, setVisitorsOverTime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [v, nvr, vot] = await Promise.allSettled([
        analyticsApi.getUniqueVisitorsDetail(token, days),
        analyticsApi.getNewVsReturning(token, days),
        analyticsApi.getVisitorsOverTime(token, days),
      ]);
      if (v.status === 'fulfilled') setVisitors(v.value);
      if (nvr.status === 'fulfilled') setNewVsReturning(nvr.value);
      if (vot.status === 'fulfilled') setVisitorsOverTime(vot.value);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = newVsReturning?.total || 0;
  const newV = newVsReturning?.newVisitors || 0;
  const returning = newVsReturning?.returning || 0;
  const maxDaily = Math.max(...visitorsOverTime.map(v => v.count), 1);

  const exportColumns = [
    { key: 'visitorId', label: 'Visitor ID' },
    { key: 'firstVisit', label: 'First Visit' },
    { key: 'lastVisit', label: 'Last Visit' },
    { key: 'pagesViewed', label: 'Pages Viewed' },
    { key: 'productsViewed', label: 'Products Viewed' },
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
            <h1 className="text-xl font-bold text-gray-900">Unique Visitors</h1>
            <p className="text-gray-500 text-sm mt-0.5">Individual visitor behavior and engagement</p>
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
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Total Unique Visitors</p>
          <p className="text-2xl font-bold mt-1 text-amber-700">{loading ? '—' : total.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">New Visitors</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{loading ? '—' : newV.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Returning Visitors</p>
          <p className="text-2xl font-bold mt-1 text-violet-600">{loading ? '—' : returning.toLocaleString()}</p>
        </div>
      </div>

      {/* New vs Returning Visual */}
      {total > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">New vs Returning</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${total > 0 ? (newV / total) * 100 : 0}%` }} />
                <div className="h-full bg-violet-500 transition-all" style={{ width: `${total > 0 ? (returning / total) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex gap-4 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-600">New ({total > 0 ? Math.round((newV / total) * 100) : 0}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="text-gray-600">Returning ({total > 0 ? Math.round((returning / total) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Growth Chart */}
      {visitorsOverTime.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Visitor Growth</h2>
          <div className="flex items-end gap-1 h-28">
            {visitorsOverTime.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-amber-500 rounded-t-sm hover:bg-amber-600 transition-colors min-h-[1px]"
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
          <h2 className="text-sm font-semibold text-gray-900">Visitor Details</h2>
          <ExportBar data={visitors} filename="unique-visitors" columns={exportColumns} />
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Visitor ID</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">First Visit</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Last Visit</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Pages Viewed</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Products Viewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</td></tr>
              ) : visitors.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">No visitor data yet</td></tr>
              ) : (
                visitors.map((v, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => setSelectedVisitor(v)}
                  >
                    <td className="px-4 py-2.5 text-xs text-gray-700 font-mono">{v.visitorId?.substring(0, 12)}...</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(v.firstVisit).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(v.lastVisit).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">{v.pagesViewed}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{v.productsViewed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVisitor(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Visitor Details</h3>
              <button onClick={() => setSelectedVisitor(null)} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Visitor ID</p>
                  <p className="text-sm text-gray-900 font-mono mt-1">{selectedVisitor.visitorId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">First Visit</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedVisitor.firstVisit).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Last Visit</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedVisitor.lastVisit).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pages Viewed</p>
                  <p className="text-sm text-gray-900 mt-1 font-semibold">{selectedVisitor.pagesViewed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Products Viewed</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedVisitor.productsViewed}</p>
                </div>
                {selectedVisitor.country && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Country</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedVisitor.country}</p>
                  </div>
                )}
                {selectedVisitor.city && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">City</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedVisitor.city}</p>
                  </div>
                )}
                {selectedVisitor.browser && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Browser</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedVisitor.browser}</p>
                  </div>
                )}
                {selectedVisitor.deviceType && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Device</p>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{selectedVisitor.deviceType}</p>
                  </div>
                )}
              </div>
              {selectedVisitor.ipAddress && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">IP Address</p>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{selectedVisitor.ipAddress}</p>
                </div>
              )}
              {selectedVisitor.userAgent && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">User Agent</p>
                  <p className="text-xs text-gray-700 mt-1 break-all">{selectedVisitor.userAgent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
