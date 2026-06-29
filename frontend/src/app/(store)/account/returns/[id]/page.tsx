'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SignInButton from '@/components/ui/SignInButton';
import {
  ArrowLeft, RotateCcw, ShoppingBag, Clock, CheckCircle, XCircle,
  Package, FileText, StickyNote, Image as ImageIcon, AlertCircle, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { returnsApi } from '@/lib/api';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

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

export default function CustomerReturnDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [ret, setRet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;

    const fetchReturn = async () => {
      setLoading(true);
      try {
        const data = await returnsApi.getById(token, id as string);
        setRet(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load return');
      } finally {
        setLoading(false);
      }
    };

    fetchReturn();
  }, [token, id]);

  if (!user || !token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Please sign in to view return details.</p>
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

  if (error || !ret) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">{error || 'Return not found'}</p>
          <Link href="/account/returns" className="text-blue-600 hover:underline mt-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Returns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/account/returns" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-violet-600" /> {ret.returnNumber}
          </h1>
          <p className="text-sm text-gray-500">Return Request Details</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${statusColor[ret.status]}`}>
              {statusLabel[ret.status]}
            </span>
            <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {resolutionLabel[ret.requestedResolution]}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDateTime(ret.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Return Items */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" /> Returned Items ({ret.items?.length || 0})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {ret.items?.map((item: any) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
              {item.product?.images?.[0]?.url ? (
                <img src={item.product.images[0].url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.orderItem?.name || item.product?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} · {formatPrice(item.total)}</p>
                {item.reason && <p className="text-xs text-gray-500 mt-0.5">Reason: {item.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reason & Comment */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" /> Return Reason
        </h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-800">{ret.customerReason}</p>
          {ret.customerComment && <p className="text-sm text-gray-600 mt-2">{ret.customerComment}</p>}
        </div>
      </div>

      {/* Customer Visible Note */}
      {ret.customerVisibleNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
            <StickyNote className="w-4 h-4" /> Note from Us
          </h2>
          <p className="text-sm text-blue-700">{ret.customerVisibleNote}</p>
        </div>
      )}

      {/* Status Timeline */}
      {ret.statusHistory?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Status History
          </h2>
          <div className="space-y-3">
            {ret.statusHistory.map((entry: any, i: number) => (
              <div key={entry.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-violet-600' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusColor[entry.newStatus]}`}>
                      {statusLabel[entry.newStatus]}
                    </span>
                    {entry.oldStatus !== entry.newStatus && (
                      <span className="text-xs text-gray-400">from {statusLabel[entry.oldStatus]}</span>
                    )}
                  </div>
                  {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Link */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-400" /> Original Order
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-sm font-medium text-gray-900">{ret.order?.orderNumber}</p>
          </div>
          <Link href={`/account/orders/${ret.order?.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            View Order
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Return Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Resolution</span><span className="font-medium text-gray-900">{resolutionLabel[ret.requestedResolution]}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Items</span><span className="text-gray-700">{ret.items?.length || 0}</span></div>
          <div className="flex justify-between font-semibold"><span className="text-gray-700">Estimated Refund</span><span className="text-violet-700">{formatPrice(ret.totalReturnValue)}</span></div>
        </div>
      </div>
    </div>
  );
}
