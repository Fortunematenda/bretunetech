'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Users, RefreshCw, Globe, Monitor, Smartphone, X } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { ExportBar } from '@/components/admin/ExportBar';

export default function VisitorsDetailPage() {
  const { token } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const [newVsReturning, setNewVsReturning] = useState<any>(null);
  const [visitorsOverTime, setVisitorsOverTime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, v, h, nvr, vot] = await Promise.allSettled([
        analyticsApi.getSummary(token),
        analyticsApi.getVisitorsList(token, days),
        analyticsApi.getHourlyVisitors(token),
        analyticsApi.getNewVsReturning(token, days),
        analyticsApi.getVisitorsOverTime(token, days),
      ]);
      if (s.status === 'fulfilled') setSummary(s.value);
      if (v.status === 'fulfilled') setVisitors(v.value);
      if (h.status === 'fulfilled') setHourly(h.value);
      if (nvr.status === 'fulfilled') setNewVsReturning(nvr.value);
      if (vot.status === 'fulfilled') setVisitorsOverTime(vot.value);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxHourly = Math.max(...hourly.map(h => h.count), 1);
  const maxDaily = Math.max(...visitorsOverTime.map(v => v.count), 1);

  const exportColumns = [
    { key: 'visitorId', label: 'Visitor ID' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'createdAt', label: 'Date & Time' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'browser', label: 'Browser' },
    { key: 'deviceType', label: 'Device' },
    { key: 'referrer', label: 'Referrer' },
    { key: 'pagesViewed', label: 'Pages Viewed' },
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
            <h1 className="text-xl font-bold text-gray-900">Visitors Today</h1>
            <p className="text-gray-500 text-sm mt-0.5">Detailed visitor analytics and session data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value={1}>Today</option>
            <option value={2}>Yesterday + Today</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Visitors Today', value: summary?.visitsToday || 0, color: 'text-violet-600' },
          { label: 'This Week', value: summary?.visitsWeek || 0, color: 'text-sky-600' },
          { label: 'This Month', value: summary?.visitsMonth || 0, color: 'text-emerald-600' },
          { label: 'Unique Today', value: summary?.uniqueVisitorsToday || 0, color: 'text-amber-700' },
          { label: 'Returning', value: newVsReturning?.returning || 0, color: 'text-pink-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? '—' : s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Hourly Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Hourly Visitors Today</h2>
        {loading ? (
          <div className="h-32 animate-pulse bg-gray-50 rounded-lg" />
        ) : (
          <div className="flex items-end gap-[2px]" style={{ height: '128px' }}>
            {hourly.map((h, i) => {
              const barHeight = maxHourly > 0 ? Math.max((h.count / maxHourly) * 100, h.count > 0 ? 8 : 0) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full bg-violet-500 rounded-t hover:bg-violet-600 transition-all"
                    style={{ height: `${barHeight}%`, minHeight: h.count > 0 ? '4px' : '0px' }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {h.count} visits
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between mt-5 text-[9px] text-gray-400">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Daily Trend */}
      {visitorsOverTime.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Visitor Trend</h2>
          <div className="flex items-end gap-1" style={{ height: '112px' }}>
            {visitorsOverTime.map((item, i) => {
              const barHeight = maxDaily > 0 ? Math.max((item.count / maxDaily) * 100, item.count > 0 ? 8 : 0) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full bg-sky-500 rounded-t hover:bg-sky-600 transition-all"
                    style={{ height: `${barHeight}%`, minHeight: item.count > 0 ? '4px' : '0px' }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {item.count} visits
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-gray-400">
            {visitorsOverTime.length > 0 && (
              <>
                <span>{new Date(visitorsOverTime[0]?.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}</span>
                {visitorsOverTime.length > 2 && (
                  <span>{new Date(visitorsOverTime[Math.floor(visitorsOverTime.length / 2)]?.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}</span>
                )}
                <span>{new Date(visitorsOverTime[visitorsOverTime.length - 1]?.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Export + Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Visitor Sessions</h2>
          <ExportBar data={visitors} filename="visitors" columns={exportColumns} />
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Visitor ID</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">IP Address</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Date & Time</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Country</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">City</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Browser</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Device</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Referrer</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Pages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</td></tr>
              ) : visitors.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">No visitor data yet</td></tr>
              ) : (
                visitors.slice(0, 100).map((v, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => setSelectedVisitor(v)}
                  >
                    <td className="px-4 py-2.5 text-xs text-gray-700 font-mono">{v.visitorId?.substring(0, 8)}...</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 font-mono">{v.ipAddress || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(v.createdAt).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{v.country || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{v.city || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{v.browser || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 capitalize">{v.deviceType || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[120px] truncate">{v.referrer || 'Direct'}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">{v.pagesViewed}</td>
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
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Date & Time</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedVisitor.createdAt).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Country</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedVisitor.country || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">City</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedVisitor.city || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Browser</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedVisitor.browser || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Device</p>
                  <p className="text-sm text-gray-900 mt-1 capitalize">{selectedVisitor.deviceType || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Referrer</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedVisitor.referrer || 'Direct'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pages Viewed</p>
                  <p className="text-sm text-gray-900 mt-1 font-semibold">{selectedVisitor.pagesViewed}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">IP Address</p>
                <p className="text-sm text-gray-900 mt-1 font-mono">{selectedVisitor.ipAddress || '—'}</p>
              </div>
              {selectedVisitor.userAgent && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">User Agent</p>
                  <p className="text-sm text-gray-700 mt-1 font-mono text-xs break-all">{selectedVisitor.userAgent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
