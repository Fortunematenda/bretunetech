'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, Truck, CreditCard, MapPin, Clock, CheckCircle,
  XCircle, Loader2, Download, User, AlertCircle, FileText, ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { adminApi, returnsApi } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/utils';

const statusSteps = [
  { status: 'PENDING',    label: 'Order Placed',       icon: Clock },
  { status: 'PAID',       label: 'Payment Confirmed',  icon: CreditCard },
  { status: 'PROCESSING', label: 'Processing',         icon: Package },
  { status: 'SHIPPED',    label: 'Shipped',            icon: Truck },
  { status: 'COMPLETED',  label: 'Delivered',          icon: CheckCircle },
];

const statusBadge: Record<string, string> = {
  PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
  PAID:       'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-violet-50 text-violet-700 border-violet-200',
  SHIPPED:    'bg-sky-50 text-sky-700 border-sky-200',
  COMPLETED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED:  'bg-red-50 text-red-700 border-red-200',
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const orderId = params.id as string;

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrder = async () => {
    if (!token || !orderId) return;
    setLoading(true);
    setError('');
    try {
      const [orderData, returnsData] = await Promise.allSettled([
        adminApi.getOrderById(token, orderId),
        returnsApi.adminList(token, { search: orderId }).catch(() => []),
      ]);
      if (orderData.status === 'fulfilled') setOrder(orderData.value);
      if (returnsData.status === 'fulfilled') setReturns(returnsData.value);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId, token]);

  const updateStatus = async (status: string) => {
    if (!token || actionBusy) return;
    setActionBusy(true);
    try {
      await adminApi.updateOrderStatus(token, orderId, status);
      showToast('success', `Order moved to ${status}`);
      fetchOrder();
    } catch {
      showToast('error', 'Status update failed');
    } finally {
      setActionBusy(false);
    }
  };

  const downloadInvoice = async () => {
    if (!token) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate invoice');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `INV-${order?.orderNumber || orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('error', 'Failed to download invoice');
    }
  };

  if (!token) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Please sign in to view order details.</p>
    </div>
  );

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-4">
      <div className="h-6 bg-gray-100 rounded w-48" />
      <div className="h-28 bg-gray-100 rounded-xl" />
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-700 font-medium mb-4">{error || 'Order not found'}</p>
      <button onClick={() => router.push('/admin/orders')} className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>
    </div>
  );

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);
  const isPaid = ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'].includes(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push('/admin/orders')} className="hover:text-gray-800 transition-colors">Orders</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">{order.orderNumber}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {order.status}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {isPaid ? 'Paid' : 'Payment Pending'}
              </span>
            </div>
            <p className="text-sm text-gray-500">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {order.status === 'PENDING' && (
              <button onClick={() => updateStatus('PAID')} disabled={actionBusy}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Confirm Payment
              </button>
            )}
            {order.status === 'PAID' && (
              <button onClick={() => updateStatus('PROCESSING')} disabled={actionBusy}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Mark Processing
              </button>
            )}
            {order.status === 'PROCESSING' && (
              <button onClick={() => updateStatus('SHIPPED')} disabled={actionBusy}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Mark Shipped
              </button>
            )}
            {order.status === 'SHIPPED' && (
              <button onClick={() => updateStatus('COMPLETED')} disabled={actionBusy}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
              </button>
            )}
            <button onClick={downloadInvoice}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700">Order Progress</h2>
            <span className="text-xs text-gray-400">Click any step to change status</span>
          </div>
          <div className="relative flex items-start justify-between">
            {/* connector line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0 mx-[5%]" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-violet-500 z-0 transition-all duration-500"
              style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 90 + 5}%` : '5%' }}
            />
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <button
                  key={step.status}
                  onClick={() => { if (!isCurrent && !actionBusy) updateStatus(step.status); }}
                  disabled={actionBusy}
                  title={isCurrent ? `Current: ${step.label}` : `Set to ${step.label}`}
                  className="relative z-10 flex flex-col items-center flex-1 gap-2 group disabled:cursor-wait"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted ? 'bg-violet-600 border-violet-600 text-white group-hover:bg-violet-700' :
                    isCurrent  ? 'bg-white border-violet-500 text-violet-600 shadow-md shadow-violet-100' :
                                 'bg-white border-gray-200 text-gray-300 group-hover:border-violet-400 group-hover:text-violet-400'
                  }`}>
                    {isCompleted
                      ? <CheckCircle className="w-4 h-4" />
                      : <step.icon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                    }
                  </div>
                  <span className={`text-[11px] font-medium text-center leading-tight transition-colors ${
                    isCurrent ? 'text-violet-600' :
                    isCompleted ? 'text-gray-800 group-hover:text-violet-600' :
                    'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">This order has been cancelled.</p>
        </div>
      )}

      {/* Main two-column content */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT: Order Items + Customer + Shipping + Notes */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Order Items</h2>
              <span className="ml-auto text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any) => (
                <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-[72px] h-[72px] bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 p-1">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product?.name || item.name}
                        className="w-full h-full object-contain object-center" />
                    ) : (
                      <Package className="w-7 h-7 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.product?.name || item.name}</p>
                    {item.product?.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.product.sku}</p>}
                    {item.warehouseLocation && (
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                        {item.warehouseLocation}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <SectionCard title="Customer Information" icon={User}>
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                <p className="font-medium text-gray-900">{order.user?.firstName} {order.user?.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="font-medium text-gray-900 break-all">{order.user?.email}</p>
              </div>
              {order.user?.phone && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                  <p className="font-medium text-gray-900">{order.user.phone}</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Shipping Address */}
          {order.address && (
            <SectionCard title="Shipping Address" icon={MapPin}>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{order.address.street}</p>
                <p>{order.address.city}, {order.address.province}</p>
                <p>{order.address.postalCode}</p>
                {order.address.country && <p>{order.address.country}</p>}
              </div>
            </SectionCard>
          )}

          {/* Order Notes */}
          {order.notes && (
            <SectionCard title="Order Notes" icon={FileText}>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
            </SectionCard>
          )}

          {/* Returns */}
          <SectionCard title="Returns" icon={RotateCcw}>
            {returns.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">No return requests for this order</p>
                {['COMPLETED', 'SHIPPED'].includes(order.status) && (
                  <button onClick={() => router.push(`/admin/returns?search=${order.orderNumber}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Create Return Manually
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {returns.map((ret) => (
                  <Link key={ret.id} href={`/admin/returns/${ret.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ret.returnNumber}</p>
                      <p className="text-xs text-gray-500">{ret.items?.length || 0} items · {formatPrice(ret.totalReturnValue)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT: Summary + Payment + Admin Actions */}
        <div className="space-y-5">

          {/* Order Summary */}
          <SectionCard title="Order Summary">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-gray-900 font-medium">
                  {order.shippingCost === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Payment */}
          <SectionCard title="Payment Details" icon={CreditCard}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">{order.paymentMethod?.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Order Date</span>
                <span className="text-gray-700 text-xs">{formatDateTime(order.createdAt)}</span>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-700 text-xs">{formatDateTime(order.updatedAt)}</span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Admin Actions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Admin Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {order.status === 'PENDING' && (
                <button onClick={() => updateStatus('PAID')} disabled={actionBusy}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  <CreditCard className="w-4 h-4" /> Confirm EFT Payment
                </button>
              )}
              {order.status === 'PAID' && (
                <button onClick={() => updateStatus('PROCESSING')} disabled={actionBusy}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  <Package className="w-4 h-4" /> Move to Processing
                </button>
              )}
              {order.status === 'PROCESSING' && (
                <button onClick={() => updateStatus('SHIPPED')} disabled={actionBusy}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  <Truck className="w-4 h-4" /> Mark as Shipped
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button onClick={() => updateStatus('COMPLETED')} disabled={actionBusy}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Mark as Delivered
                </button>
              )}
              <button onClick={downloadInvoice}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors">
                <Download className="w-4 h-4" /> Download Invoice
              </button>
              {!isCancelled && (
                <button onClick={() => { if (confirm('Cancel this order? This cannot be undone.')) updateStatus('CANCELLED'); }}
                  disabled={actionBusy}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition-colors disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
