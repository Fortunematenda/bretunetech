'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CreditCard, MapPin, Clock, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { getOrderById } from '@/lib/orders-api';
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
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
        const data = await getOrderById(orderId, token);
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

  if (!user || !token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Please sign in to view order details.</p>
          <Link href="/login" className="text-blue-600 hover:underline mt-2 inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">{error || 'Order not found'}</p>
          <Link 
            href="/account/orders" 
            className="text-blue-600 hover:underline mt-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/account/orders" 
          className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order.status !== 'CANCELLED' && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/orders/${order.id}/invoice`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `INV-${order.orderNumber}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }
                  } catch (err) {
                    console.error('Failed to download invoice:', err);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            )}
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                    <step.icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-xs font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
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
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.name || item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="text-gray-600">
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
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="text-sm">
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Method:</span> {order.paymentMethod}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{' '}
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'PAID' || order.status === 'COMPLETED' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status === 'PAID' || order.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                </span>
              </p>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h2 className="font-semibold text-blue-900 mb-2">Need Help?</h2>
            <p className="text-sm text-blue-700 mb-4">
              If you have any questions about your order, please contact us.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
