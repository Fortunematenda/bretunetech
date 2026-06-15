'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck, CreditCard, MapPin, Clock, CheckCircle, XCircle, Loader2, Download, User, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/utils';

const statusSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'PAID', label: 'Payment Confirmed', icon: CreditCard },
  { status: 'PROCESSING', label: 'Processing', icon: Loader2 },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'COMPLETED', label: 'Delivered', icon: CheckCircle },
];

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAID: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-violet-100 text-violet-700 border-violet-200',
  SHIPPED: 'bg-sky-100 text-sky-700 border-sky-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = params.id as string;

  useEffect(() => {
    if (!token || !orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getOrderById(token, orderId);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-500">Please sign in to view order details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="h-64 bg-slate-900 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">{error || 'Order not found'}</p>
          <button 
            onClick={() => router.push('/admin/orders')}
            className="text-blue-400 hover:text-blue-300 mt-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/admin/orders')}
          className="text-sm text-slate-500 hover:text-slate-300 inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Order {order.orderNumber}</h1>
            <p className="text-slate-500 text-sm mt-1">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusStyles[order.status] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Progress */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-blue-900' : ''}`}>
                    <step.icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-xs font-medium ${isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-white">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {order.items?.map((item: any) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-600 mx-auto mt-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.product?.name || item.name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    {item.warehouseLocation && (
                      <p className="text-xs text-slate-500 mt-1">
                        Warehouse: {item.warehouseLocation}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-slate-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-white">Customer Information</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white">
                <span className="text-slate-500">Name:</span> {order.user?.firstName} {order.user?.lastName}
              </p>
              <p className="text-white">
                <span className="text-slate-500">Email:</span> {order.user?.email}
              </p>
              {order.user?.phone && (
                <p className="text-white">
                  <span className="text-slate-500">Phone:</span> {order.user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-slate-400" />
                <h2 className="font-semibold text-white">Shipping Address</h2>
              </div>
              <div className="text-slate-300">
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.province}</p>
                <p>{order.address.postalCode}</p>
                <p>{order.address.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-slate-200">{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Payment</h2>
            <div className="text-sm">
              <p className="text-slate-400 mb-2">
                <span className="font-medium text-slate-200">Method:</span> {order.paymentMethod}
              </p>
              <p className="text-slate-400">
                <span className="font-medium text-slate-200">Status:</span>{' '}
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'PAID' || order.status === 'COMPLETED' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.status === 'PAID' || order.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                </span>
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Order Notes</h2>
              <p className="text-sm text-slate-400">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
