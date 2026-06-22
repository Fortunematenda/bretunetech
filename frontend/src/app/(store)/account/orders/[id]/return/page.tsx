'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, Package, Check, X, AlertCircle,
  ShoppingBag, FileText, Image as ImageIcon, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { getOrderById } from '@/lib/orders-api';
import { returnsApi } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/utils';

const RETURN_REASONS = [
  'Wrong item received',
  'Damaged item',
  'Faulty item',
  'Missing parts/accessories',
  'No longer needed',
  'Other',
];

const RESOLUTIONS = [
  { value: 'REFUND', label: 'Refund' },
  { value: 'REPLACEMENT', label: 'Replacement' },
  { value: 'EXCHANGE', label: 'Exchange' },
  { value: 'STORE_CREDIT', label: 'Store Credit' },
];

export default function ReturnRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [resolution, setResolution] = useState('REFUND');
  const [comment, setComment] = useState('');

  const orderId = params.id as string;

  useEffect(() => {
    if (!token || !orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(orderId, token);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  const toggleItem = (itemId: string, maxQty: number) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      if (current === 0) {
        return { ...prev, [itemId]: 1 };
      } else if (current < maxQty) {
        return { ...prev, [itemId]: current + 1 };
      } else {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
    });
  };

  const decreaseQty = (itemId: string) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !order) return;

    const items = Object.entries(selectedItems).map(([orderItemId, quantity]) => ({
      orderItemId,
      quantity,
      reason: reason === 'Other' ? customReason : reason,
    }));

    if (items.length === 0) {
      setError('Please select at least one item to return');
      return;
    }

    if (reason === 'Other' && !customReason.trim()) {
      setError('Please specify the reason for return');
      return;
    }

    setSubmitting(true);
    try {
      await returnsApi.create(token, {
        orderId,
        items,
        requestedResolution: resolution,
        customerReason: reason === 'Other' ? customReason : reason,
        customerComment: comment || null,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Please sign in to request a return.</p>
          <Link href="/login" className="text-blue-600 hover:underline mt-2 inline-block">Sign In</Link>
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

  if (error && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">{error}</p>
          <Link href="/account/orders" className="text-blue-600 hover:underline mt-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <Check className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Return Request Submitted</h1>
          <p className="text-gray-600 mb-6">Your return request has been submitted successfully. We will review it and get back to you shortly.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/account/returns" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
              View My Returns
            </Link>
            <Link href="/account/orders" className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if order is eligible for returns
  if (!['COMPLETED', 'SHIPPED'].includes(order.status)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Eligible for Return</h1>
          <p className="text-gray-600 mb-4">Returns can only be requested for completed or shipped orders.</p>
          <p className="text-sm text-gray-500 mb-6">Current status: <span className="font-semibold">{order.status}</span></p>
          <Link href="/account/orders" className="text-blue-600 hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const totalReturnValue = Object.entries(selectedItems).reduce((sum, [itemId, qty]) => {
    const item = order.items.find((i: any) => i.id === itemId);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/account/orders/${orderId}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-violet-600" /> Request Return
          </h1>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Items */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" /> Select Items to Return
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                {item.product?.images?.[0]?.url ? (
                  <img src={item.product.images[0].url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedItems[item.id] ? (
                    <button type="button" onClick={() => toggleItem(item.id, item.quantity)}
                      className="px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                      Select
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => decreaseQty(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{selectedItems[item.id]}</span>
                      <button type="button" onClick={() => toggleItem(item.id, item.quantity)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason & Resolution */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Return Details
          </h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Reason for Return *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500">
              <option value="">Select a reason</option>
              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Please specify *</label>
              <input type="text" value={customReason} onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500"
                placeholder="Describe the reason..." />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Preferred Resolution *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RESOLUTIONS.map(r => (
                <button key={r.value} type="button" onClick={() => setResolution(r.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    resolution === r.value
                      ? 'bg-violet-50 border-violet-500 text-violet-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Additional Comments (optional)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="Add any additional details about your return..." />
          </div>
        </div>

        {/* Summary */}
        {Object.keys(selectedItems).length > 0 && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Return Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Items</span><span className="text-gray-900">{Object.keys(selectedItems).length}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Resolution</span><span className="text-gray-900">{RESOLUTIONS.find(r => r.value === resolution)?.label}</span></div>
              <div className="flex justify-between font-semibold"><span className="text-gray-700">Estimated Refund</span><span className="text-violet-700">{formatPrice(totalReturnValue)}</span></div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting || Object.keys(selectedItems).length === 0}
            className="flex-1 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
