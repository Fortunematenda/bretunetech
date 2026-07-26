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
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
  INSPECTING:               'bg-primary/5 text-primary border-primary/20',
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
      <AdminPageHeader
        title="Returns / RMA"
        description={`${returns.length} total returns${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`}
        actions={
          <Button type="button" variant="outline" size="icon" onClick={fetchReturns} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by return #, order #, customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-primary">
          {RETURN_STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : statusLabel[s] || s}</option>)}
        </select>
        <select value={resolutionFilter} onChange={(e) => setResolutionFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-primary">
          {RESOLUTIONS.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All Resolutions' : resolutionLabel[r] || r}</option>)}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Return #</TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resolution</TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                <TableHead className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Value</TableHead>
                <TableHead className="px-5 py-3 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-28" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-8" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-20" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-16 ml-auto" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-4" /></TableCell>
                  </TableRow>
                ))
              ) : returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-5 py-16 text-center">
                    <RotateCcw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No return requests yet</p>
                    <p className="text-gray-400 text-sm mt-1">Return requests from customers will appear here.</p>
                  </TableCell>
                </TableRow>
              ) : returns.map((ret) => (
                <TableRow key={ret.id} onClick={() => router.push(`/admin/returns/${ret.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group">
                  <TableCell className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-800">{ret.returnNumber}</TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-xs text-gray-500">{ret.order?.orderNumber || '—'}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <p className="text-sm text-gray-900">{ret.customer?.firstName} {ret.customer?.lastName}</p>
                    <p className="text-xs text-gray-500">{ret.customer?.email}</p>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(ret.createdAt)}</TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-gray-700">{ret.items?.length || 0}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {resolutionLabel[ret.requestedResolution] || ret.requestedResolution}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusColor[ret.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {statusLabel[ret.status] || ret.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right font-semibold text-gray-900">{formatPrice(ret.totalReturnValue || 0)}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
