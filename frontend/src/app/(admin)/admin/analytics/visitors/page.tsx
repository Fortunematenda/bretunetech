'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Users, RefreshCw, Globe, X, TrendingUp, Calendar } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import VisitorTrendChart from '@/components/admin/VisitorTrendChart';
import { ExportBar } from '@/components/admin/ExportBar';
import { Button } from '@/components/ui/button';
import { analyticsApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

export default function VisitorsDetailPage() {
  const { token } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const [newVsReturning, setNewVsReturning] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, v, h, nvr] = await Promise.allSettled([
        analyticsApi.getSummary(token),
        analyticsApi.getVisitorsList(token, days),
        analyticsApi.getHourlyVisitors(token),
        analyticsApi.getNewVsReturning(token, days),
      ]);
      if (s.status === 'fulfilled') setSummary(s.value);
      if (v.status === 'fulfilled') setVisitors(v.value);
      if (h.status === 'fulfilled') setHourly(h.value);
      if (nvr.status === 'fulfilled') setNewVsReturning(nvr.value);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxHourly = Math.max(...hourly.map(h => h.count), 1);

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
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <AdminPageHeader
            title="Visitors Today"
            description="Detailed visitor analytics and session data"
            actions={
              <>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value={1}>Today</option>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminKpiCard
          label="Visitors Today"
          value={loading ? '—' : (summary?.visitsToday || 0).toLocaleString()}
          icon={Users}
          tone="primary"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="This Week"
          value={loading ? '—' : (summary?.visitsWeek || 0).toLocaleString()}
          icon={TrendingUp}
          tone="sky"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="This Month"
          value={loading ? '—' : (summary?.visitsMonth || 0).toLocaleString()}
          icon={Calendar}
          tone="emerald"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Unique Today"
          value={loading ? '—' : (summary?.uniqueVisitorsToday || 0).toLocaleString()}
          icon={Globe}
          tone="amber"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="Returning"
          value={loading ? '—' : (newVsReturning?.returning || 0).toLocaleString()}
          icon={Users}
          tone="rose"
          loading={loading}
          showArrow={false}
        />
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
                    className="w-full bg-primary rounded-t hover:bg-primary/90 transition-all"
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

      <VisitorTrendChart token={token} defaultDays={7} />

      {/* Export + Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Visitor Sessions</h2>
          <ExportBar data={visitors} filename="visitors" columns={exportColumns} />
        </div>
        <div className="overflow-y-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow className="border-b border-gray-100">
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Visitor ID</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">IP Address</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Date & Time</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Country</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">City</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Browser</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Device</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Referrer</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Pages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {loading ? (
                <TableRow><TableCell colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</TableCell></TableRow>
              ) : visitors.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">No visitor data yet</TableCell></TableRow>
              ) : (
                visitors.slice(0, 100).map((v, i) => (
                  <TableRow 
                    key={i} 
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => setSelectedVisitor(v)}
                  >
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 font-mono">{v.visitorId?.substring(0, 8)}...</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 font-mono">{v.ipAddress || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(v.createdAt).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{v.country || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{v.city || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{v.browser || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 capitalize">{v.deviceType || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500 max-w-[120px] truncate">{v.referrer || 'Direct'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-gray-900">{v.pagesViewed}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
