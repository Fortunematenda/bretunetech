'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SignInButton from '@/components/ui/SignInButton';
import {
  RotateCcw, ShoppingBag, Clock, CheckCircle, XCircle,
  ChevronRight, AlertCircle, Loader2, Package, ArrowLeft, SlidersHorizontal, Search, HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { returnsApi } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/utils';

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

export default function CustomerReturnsPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchReturns = async () => {
      setLoading(true);
      try {
        const data = await returnsApi.list(token);
        setReturns(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load returns');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [token]);

  if (!user || !token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Please sign in to view your returns.</p>
          <SignInButton className="text-blue-600 hover:underline mt-2 inline-block">Sign In</SignInButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const filterMap = {
    ALL: 'All',
    REQUESTED: 'Requested',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    AWAITING_CUSTOMER_RETURN: 'Awaiting Return',
    COMPLETED: 'Completed',
  };

  const filteredReturns = returns.filter((r) => {
    const matchesFilter = activeFilter === 'ALL' || r.status === activeFilter;
    const matchesSearch = searchQuery === '' || 
      r.returnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.order?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      {/* Mobile Layout */}
      <div className="sm:hidden min-h-screen bg-gray-50 pb-28">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
          <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Returns</h1>
          <button aria-label="Help" className="text-gray-700">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
            {error}
          </div>
        )}

        <div className="px-4 pt-5">
          {/* Status tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {Object.entries(filterMap).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === key
                    ? 'bg-[#003d7a] text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search returns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]"
            />
          </div>

          {loading ? (
            <div className="mt-6 flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-base font-semibold text-gray-900 mb-2">No returns found</h2>
              <p className="text-sm text-gray-500 mb-4">
                {returns.length === 0 ? "You haven't submitted any return requests." : "No returns match your search."}
              </p>
              <Link href="/account/orders" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003d7a] hover:bg-blue-800 text-white font-medium rounded-xl transition-colors text-sm">
                <ShoppingBag className="w-4 h-4" /> View Orders
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredReturns.map((ret) => (
                <Link key={ret.id} href={`/account/returns/${ret.id}`} className="block">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900">{ret.returnNumber}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusColor[ret.status]}`}>
                            {statusLabel[ret.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Order #{ret.order?.orderNumber}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(ret.createdAt)}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-600">
                        {ret.items?.length || 0} item{ret.items?.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(ret.totalReturnValue)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-violet-600" /> My Returns
          </h1>
          <p className="text-gray-500 mt-1">Track and manage your return requests</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {returns.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No returns yet</h2>
            <p className="text-gray-500 mb-6">You haven't submitted any return requests.</p>
            <Link href="/account/orders" className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">
              <ShoppingBag className="w-4 h-4" /> View Orders
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {returns.map((ret) => (
                <Link key={ret.id} href={`/account/returns/${ret.id}`}
                  className="block hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="font-mono text-sm font-semibold text-gray-900">{ret.returnNumber}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusColor[ret.status]}`}>
                            {statusLabel[ret.status]}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {resolutionLabel[ret.requestedResolution]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5" /> Order #{ret.order?.orderNumber}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {formatDateTime(ret.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {ret.items?.length || 0} item{ret.items?.length !== 1 ? 's' : ''} · Estimated refund: <span className="font-semibold text-gray-900">{formatPrice(ret.totalReturnValue)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
