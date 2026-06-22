'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw, Search, ChevronRight, CheckCircle, AlertTriangle,
  Clock, XCircle, Package, Eye, Filter, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { returnsApi } from '@/lib/api';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

const RETURN_STATUSES = [
  'ALL', 'REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED',
  'AWAITING_CUSTOMER_RETURN', 'RECEIVED', 'INSPECTING',
  'REFUND_APPROVED', 'REPLACEMENT_SENT', 'COMPLETED', 'CANCELLED',
];

const RESOLUTIONS = ['ALL', 'REFUND', 'REPLACEMENT', 'EXCHANGE', 'STORE_CREDIT'];

const statusLabel: Record<string, string> = {
  REQUESTED: 'Requested', UNDER_REVIEW: 'Under Review', APPROVED: 'Approved',
  REJECTED: 'Rejected', AWAITING_CUSTOMER_RETURN: 'Awaiting Return',
  RECEIVED: 'Received', INSPECTING: 'Inspecting', REFUND_APPROVED: 'Refund Approved',
  REPLACEMENT_SENT: 'Replacement Sent', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const statusColor: Record<string, string> = {
  REQUESTED:                'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW:             'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED:                 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED:                 'bg-red-50 text-red-700 border-red-200',
  AWAITING_CUSTOMER_RETURN: 'bg-orange-50 text-orange-700 border-orange-200',
  RECEIVED:                 'bg-sky-50 text-sky-700 border-sky-200',
  INSPECTING:               'bg-violet-50 text-violet-700 border-violet-200',
  REFUND_APPROVED:          'bg-teal-50 text-teal-700 border-teal-200',
  REPLACEMENT_SENT:         'bg-indigo-50 text-indigo-700 border-indigo-200',
  COMPLETED:                'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED:                'bg-gray-100 text-gray-500 border-gray-200',
};

const resolutionLabel: Record<string, string> = {
  REFUND: 'Refund', REPLACEMENT: 'Replacement', EXCHANGE: 'Exchange', STORE_CREDIT: 'Store Credit',
};

export default function AdminReturnsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [resolutionFilter, setResolutionFilter] = useState('ALL');
  const [error, setError] = useState('');

  const fetchReturns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (resolutionFilter !== 'ALL') params.resolution = resolutionFilter;
      if (search) params.search = search;
      const data = await returnsApi.adminList(token, Object.keys(params).length ? params : undefined);
      setReturns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, resolutionFilter, search]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const pendingCount = returns.filter(r => ['REQUESTED', 'UNDER_REVIEW'].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-violet-600" /> Returns / RMA
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {returns.length} total returns
            {pendingCount > 0 && <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">{pendingCount} pending</span>}
          </p>
        </div>
        <button onClick={fetchReturns} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by return #, order #, customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-violet-500">
          {RETURN_STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : statusLabel[s] || s}</option>)}
        </select>
        <select value={resolutionFilter} onChange={(e) => setResolutionFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-violet-500">
          {RESOLUTIONS.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All Resolutions' : resolutionLabel[r] || r}</option>)}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Return #</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resolution</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Value</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-8" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-16 ml-auto" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-4" /></td>
                  </tr>
                ))
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <RotateCcw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No return requests yet</p>
                    <p className="text-gray-400 text-sm mt-1">Return requests from customers will appear here.</p>
                  </td>
                </tr>
              ) : returns.map((ret) => (
                <tr key={ret.id} onClick={() => router.push(`/admin/returns/${ret.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-800">{ret.returnNumber}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{ret.order?.orderNumber || '—'}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-900">{ret.customer?.firstName} {ret.customer?.lastName}</p>
                    <p className="text-xs text-gray-500">{ret.customer?.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(ret.createdAt)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{ret.items?.length || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {resolutionLabel[ret.requestedResolution] || ret.requestedResolution}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusColor[ret.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {statusLabel[ret.status] || ret.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{formatPrice(ret.totalReturnValue || 0)}</td>
                  <td className="px-5 py-3.5">
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
