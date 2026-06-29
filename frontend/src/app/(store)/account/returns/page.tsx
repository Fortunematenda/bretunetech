'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SignInButton from '@/components/ui/SignInButton';
import {
  RotateCcw, ShoppingBag, Clock, CheckCircle, XCircle,
  ChevronRight, AlertCircle, Loader2, Package,
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
  const { token, user } = useAuthStore();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
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
  );
}
