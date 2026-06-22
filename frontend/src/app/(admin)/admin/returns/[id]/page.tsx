'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, User, Mail, Phone, ShoppingBag, Package,
  ChevronRight, CheckCircle, AlertCircle, XCircle, Clock, Truck,
  Eye, FileText, StickyNote, Image as ImageIcon, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { returnsApi } from '@/lib/api';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

const statusLabel: Record<string, string> = {
  REQUESTED: 'Requested', UNDER_REVIEW: 'Under Review', APPROVED: 'Approved',
  REJECTED: 'Rejected', AWAITING_CUSTOMER_RETURN: 'Awaiting Customer Return',
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

const ACTION_BUTTONS: { status: string; label: string; color: string }[] = [
  { status: 'UNDER_REVIEW',             label: 'Start Review',       color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { status: 'APPROVED',                 label: 'Approve Return',     color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { status: 'REJECTED',                 label: 'Reject Return',      color: 'bg-red-600 hover:bg-red-700 text-white' },
  { status: 'AWAITING_CUSTOMER_RETURN', label: 'Awaiting Return',    color: 'bg-orange-600 hover:bg-orange-700 text-white' },
  { status: 'RECEIVED',                 label: 'Mark Received',      color: 'bg-sky-600 hover:bg-sky-700 text-white' },
  { status: 'INSPECTING',              label: 'Start Inspection',   color: 'bg-violet-600 hover:bg-violet-700 text-white' },
  { status: 'REFUND_APPROVED',          label: 'Approve Refund',     color: 'bg-teal-600 hover:bg-teal-700 text-white' },
  { status: 'REPLACEMENT_SENT',         label: 'Send Replacement',   color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  { status: 'COMPLETED',                label: 'Complete Return',    color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { status: 'CANCELLED',                label: 'Cancel Return',      color: 'bg-gray-600 hover:bg-gray-700 text-white' },
];

export default function AdminReturnDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [ret, setRet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReturn = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await returnsApi.adminGetById(token, id as string);
      setRet(data);
      setAdminNote(data.adminNote || '');
      setCustomerNote(data.customerVisibleNote || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load return');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { fetchReturn(); }, [fetchReturn]);

  const updateStatus = async (newStatus: string) => {
    if (!token || !ret || actionBusy) return;
    setActionBusy(true);
    try {
      await returnsApi.adminUpdateStatus(token, ret.id, { status: newStatus });
      showToast('success', `Status updated to ${statusLabel[newStatus]}`);
      fetchReturn();
    } catch {
      showToast('error', 'Failed to update status');
    } finally {
      setActionBusy(false);
    }
  };

  const saveNotes = async () => {
    if (!token || !ret) return;
    try {
      await returnsApi.adminAddNote(token, ret.id, { adminNote, customerVisibleNote: customerNote });
      showToast('success', 'Notes saved');
      setNoteModal(false);
      fetchReturn();
    } catch {
      showToast('error', 'Failed to save notes');
    }
  };

  // Determine which status transitions are available
  const getAvailableActions = (currentStatus: string) => {
    const flow: Record<string, string[]> = {
      REQUESTED:                ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
      UNDER_REVIEW:             ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED:                 ['AWAITING_CUSTOMER_RETURN', 'CANCELLED'],
      AWAITING_CUSTOMER_RETURN: ['RECEIVED', 'CANCELLED'],
      RECEIVED:                 ['INSPECTING', 'REFUND_APPROVED', 'REPLACEMENT_SENT', 'COMPLETED'],
      INSPECTING:              ['REFUND_APPROVED', 'REPLACEMENT_SENT', 'COMPLETED', 'REJECTED'],
      REFUND_APPROVED:          ['COMPLETED'],
      REPLACEMENT_SENT:         ['COMPLETED'],
    };
    return flow[currentStatus] || [];
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-6 bg-gray-100 rounded w-48" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
      <div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>
    </div>
  );

  if (error || !ret) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-700 font-medium mb-4">{error || 'Return not found'}</p>
      <button onClick={() => router.push('/admin/returns')} className="inline-flex items-center gap-2 text-sm text-violet-600">
        <ArrowLeft className="w-4 h-4" /> Back to Returns
      </button>
    </div>
  );

  const availableActions = getAvailableActions(ret.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push('/admin/returns')} className="hover:text-gray-800 transition-colors">Returns</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">{ret.returnNumber}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border-2 border-violet-200 flex items-center justify-center text-violet-600 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{ret.returnNumber}</h1>
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${statusColor[ret.status]}`}>
                {statusLabel[ret.status]}
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {resolutionLabel[ret.requestedResolution]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              <Link href={`/admin/orders/${ret.order?.id}`} className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
                <ShoppingBag className="w-3.5 h-3.5" /> Order #{ret.order?.orderNumber}
              </Link>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDateTime(ret.createdAt)}</span>
              <span className="flex items-center gap-1.5 font-semibold text-gray-800">Value: {formatPrice(ret.totalReturnValue)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {availableActions.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50/50 flex items-center gap-2 flex-wrap">
            {availableActions.map((status) => {
              const btn = ACTION_BUTTONS.find(b => b.status === status);
              if (!btn) return null;
              return (
                <button key={status} onClick={() => updateStatus(status)} disabled={actionBusy}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${btn.color}`}>
                  {btn.label}
                </button>
              );
            })}
            <button onClick={() => setNoteModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors ml-auto">
              <StickyNote className="w-3.5 h-3.5 inline mr-1" /> Add Note
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Return Items */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" /> Return Items ({ret.items?.length || 0})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {ret.items?.map((item: any) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 text-gray-300" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.orderItem?.name || item.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{item.product?.sku ? `SKU: ${item.product.sku}` : ''}</p>
                    {item.reason && <p className="text-xs text-gray-500 mt-0.5">Reason: {item.reason}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">Qty: {item.quantity} of {item.orderItem?.quantity || '?'}</p>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reason & Comment */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Customer Reason</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-800">{ret.customerReason}</p>
              {ret.customerComment && <p className="text-sm text-gray-600 mt-2">{ret.customerComment}</p>}
            </div>
          </div>

          {/* Notes */}
          {(ret.adminNote || ret.customerVisibleNote) && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-gray-400" /> Notes
              </h3>
              {ret.adminNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[10px] uppercase font-semibold text-amber-600 mb-1">Internal Note</p>
                  <p className="text-sm text-gray-700">{ret.adminNote}</p>
                </div>
              )}
              {ret.customerVisibleNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-[10px] uppercase font-semibold text-blue-600 mb-1">Customer Visible Note</p>
                  <p className="text-sm text-gray-700">{ret.customerVisibleNote}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Timeline */}
          {ret.statusHistory?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Status History
              </h3>
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
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Customer
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{ret.customer?.firstName} {ret.customer?.lastName}</p>
              {ret.customer?.email && (
                <a href={`mailto:${ret.customer.email}`} className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {ret.customer.email}
                </a>
              )}
              {ret.customer?.phone && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {ret.customer.phone}
                </p>
              )}
              <Link href={`/admin/customers/${ret.customer?.id}`} className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 mt-1">
                View Profile <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" /> Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Order #</span><span className="font-medium text-gray-900">{ret.order?.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order Date</span><span className="text-gray-700">{formatDate(ret.order?.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order Total</span><span className="font-semibold text-gray-900">{formatPrice(ret.order?.totalPrice || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="text-gray-700">{ret.order?.paymentMethod || '—'}</span></div>
            </div>
            <Link href={`/admin/orders/${ret.order?.id}`} className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 mt-3">
              View Order <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Return Summary */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Return Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Resolution</span><span className="font-medium text-gray-900">{resolutionLabel[ret.requestedResolution]}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="text-gray-700">{ret.items?.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Return Value</span><span className="font-bold text-emerald-600">{formatPrice(ret.totalReturnValue)}</span></div>
              {ret.completedAt && <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="text-gray-700">{formatDate(ret.completedAt)}</span></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setNoteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Add Notes</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Internal Admin Note</label>
                  <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500 resize-none"
                    placeholder="Only visible to admin..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Customer Visible Note</label>
                  <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500 resize-none"
                    placeholder="Customer can see this note..." />
                </div>
              </div>
              <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
                <button onClick={() => setNoteModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={saveNotes} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold">Save Notes</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
