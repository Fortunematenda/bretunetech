'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  ClipboardList,
  CreditCard,
  Headphones,
  MapPin,
  Package,
  ReceiptText,
  Truck,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { getOrderById } from '@/lib/orders-api';
import { formatPrice, formatDateTime } from '@/lib/utils';

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: any;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { label: 'Placed', status: 'PENDING', done: true },
    { label: 'Confirmed', status: 'PAID', done: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'].includes(status) },
    { label: 'Shipped', status: 'SHIPPED', done: ['SHIPPED', 'COMPLETED'].includes(status) },
    { label: 'Out for Delivery', status: 'SHIPPED', done: status === 'COMPLETED' },
    { label: 'Delivered', status: 'COMPLETED', done: status === 'COMPLETED', active: status === 'COMPLETED' },
  ];

  return (
    <div className="mt-5">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-blue-200" />

        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step.active
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.done
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {step.active ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Package className="w-4 h-4" />
              )}
            </div>

            <p
              className={`text-[11px] font-bold mt-2 text-center leading-tight ${
                step.active ? 'text-green-600' : 'text-slate-900'
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderItem({
  image,
  name,
  quantity,
  price,
}: {
  image: string;
  name: string;
  quantity: number;
  price: number;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-gray-100 overflow-hidden shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.currentTarget.src = '/assets/placeholder.svg';
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
          {name}
        </p>
        <p className="text-xs text-slate-500 mt-1">Qty: {quantity}</p>
      </div>

      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
        {formatPrice(price * quantity)}
      </p>
    </div>
  );
}

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
  }, [token, orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link href="/account/orders" className="text-blue-600 font-semibold">
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const statusColor = order.status === 'COMPLETED' ? 'green' : order.status === 'CANCELLED' ? 'red' : 'blue';

  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-14 px-4 flex items-center justify-between">
        <Link href="/account/orders" className="w-9 h-9 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-900" />
        </Link>

        <h1 className="text-base font-bold text-slate-900">Order Details</h1>

        <Link href="/contact" className="w-9 h-9 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-slate-900" />
        </Link>
      </header>

      <div className="px-4 pt-4 space-y-4 max-w-xl mx-auto">
        {/* Order Header */}
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Order #{order.orderNumber}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-${statusColor}-50 text-${statusColor}-700 text-xs font-bold shrink-0`}>
              <CheckCircle className="w-4 h-4" />
              {order.status}
            </span>
          </div>

          <OrderTimeline status={order.status} />
        </Card>

        {/* Delivery Address */}
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <SectionTitle icon={MapPin} title="Delivery Address" />

            <Link href="/account/addresses" className="text-sm font-bold text-blue-600">
              Change
            </Link>
          </div>

          <div className="pl-10">
            <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {order.shippingAddress?.street || 'N/A'}
              <br />
              {order.shippingAddress?.city || ''}, {order.shippingAddress?.postalCode || ''}
              <br />
              {order.shippingAddress?.country || 'South Africa'}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Phone: {user?.phone || 'N/A'}
            </p>
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-4">
          <SectionTitle icon={ReceiptText} title="Order Summary" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{formatPrice(0)}</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-extrabold text-blue-600 text-lg">
                {formatPrice(order.totalPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-slate-500">Paid via {order.paymentMethod || 'EFT'}</p>
              <span className={`px-3 py-1 rounded-full bg-${statusColor}-50 text-${statusColor}-700 text-xs font-bold`}>
                {order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'COMPLETED' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4">
          <SectionTitle icon={ClipboardList} title={`Items (${order.items?.length || 0})`} />

          <div>
            {order.items?.map((item: any, index: number) => (
              <OrderItem
                key={index}
                image={item.product?.images?.[0]?.url || '/assets/placeholder.svg'}
                name={item.name || item.product?.name || 'Product'}
                quantity={item.quantity}
                price={item.price}
              />
            ))}
          </div>
        </Card>

        {/* Order Information */}
        <Card className="p-4">
          <SectionTitle icon={CreditCard} title="Order Information" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Order ID</span>
              <span className="font-medium text-slate-900 text-right">
                {order.orderNumber}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-medium text-slate-900">{order.paymentMethod || 'EFT'}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Payment Status</span>
              <span className={`px-2.5 py-1 rounded-full bg-${statusColor}-50 text-${statusColor}-700 text-xs font-bold`}>
                {order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'COMPLETED' ? 'Paid' : 'Pending'}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Order Date</span>
              <span className="font-medium text-slate-900 text-right">
                {formatDateTime(order.createdAt)}
              </span>
            </div>

            {order.status === 'COMPLETED' && order.updatedAt && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Delivered Date</span>
                <span className="font-medium text-slate-900 text-right">
                  {formatDateTime(order.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Help */}
        <Card className="p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <Headphones className="w-5 h-5 text-blue-600" />
          </div>

          <h3 className="text-base font-bold text-slate-900">Need Help?</h3>
          <p className="text-sm text-slate-500 mt-1">
            If you have any issues with your order, we are here to help.
          </p>

          <Link
            href="/contact"
            className="mt-4 h-11 rounded-xl border border-blue-600 text-blue-600 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            Contact Support
          </Link>
        </Card>
      </div>
    </main>
  );
}
