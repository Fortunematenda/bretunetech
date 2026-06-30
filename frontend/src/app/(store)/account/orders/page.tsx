'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SignInButton from '@/components/ui/SignInButton';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, ShoppingBag, ArrowRight, Loader2, ArrowLeft, HelpCircle, Search, SlidersHorizontal, FileText, RotateCcw, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getOrders } from '@/lib/orders-api';
import { formatPrice, formatDateTime } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
    product?: {
      images?: { url: string }[];
    };
  }[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'PAID':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'PROCESSING':
      return <Package className="w-5 h-5 text-blue-500" />;
    case 'SHIPPED':
      return <Truck className="w-5 h-5 text-purple-500" />;
    case 'COMPLETED':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'CANCELLED':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    getOrders(token)
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load orders');
        setIsLoading(false);
      });
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-500 mb-6">Please login to view your orders</p>
          <SignInButton className="text-blue-600 hover:underline">Login</SignInButton>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2" />
            <Link href="/account" className="hover:text-gray-700">Account</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2" />
            <span className="text-gray-900">Orders</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">My Orders</h1>
          
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-full">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Start shopping to see your orders here! Once you place an order, it will appear on this page.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Products
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filterMap: Record<string, string[]> = {
    All: [],
    Processing: ['PENDING', 'PAID', 'PROCESSING'],
    Shipped: ['SHIPPED'],
    Delivered: ['COMPLETED'],
    Cancelled: ['CANCELLED'],
  };
  const statusLabel = (s: string) => (s === 'COMPLETED' ? 'Delivered' : s.charAt(0) + s.slice(1).toLowerCase());
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = activeFilter === 'All' || filterMap[activeFilter].includes(o.status);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || o.orderNumber.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  return (
    <>
    {/* ══ MOBILE LAYOUT (Image 4) ══ */}
    <div className="sm:hidden bg-gray-50 min-h-screen pb-24">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
        <Link href="/contact" aria-label="Help" className="text-gray-700"><HelpCircle className="w-5 h-5" /></Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {(['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === f ? 'bg-[#003d7a] text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by product or order ID"
            className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="px-4 space-y-3">
        {filteredOrders.map((order) => {
          const itemNames = order.items.map((i) => i.name).join(', ');
          const thumbs = order.items.slice(0, 2);
          const extra = order.items.length - thumbs.length;
          const isDelivered = order.status === 'COMPLETED';
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">Order #{order.orderNumber}</p>
                  <p className="text-[11px] text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {statusLabel(order.status)}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 shrink-0">
                  {thumbs.map((item, i) => (
                    <div key={i} className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                      {item.product?.images?.[0]?.url
                        ? <img src={item.product.images[0].url} alt={item.name} className="w-full h-full object-contain p-1" />
                        : <Package className="w-5 h-5 text-gray-300" />}
                    </div>
                  ))}
                  {extra > 0 && (
                    <div className="w-8 h-14 flex items-center justify-center text-xs font-bold text-gray-500">+{extra}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">{itemNames}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-gray-400">Total</p>
                  <p className="text-base font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold">
                    <FileText className="w-3.5 h-3.5" /> View Details
                  </Link>
                  {isDelivered ? (
                    <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#003d7a] text-white text-xs font-semibold">
                      <RotateCcw className="w-3.5 h-3.5" /> Reorder
                    </Link>
                  ) : (
                    <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#003d7a] text-white text-xs font-semibold">
                      <Truck className="w-3.5 h-3.5" /> Track Order
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No orders match this filter.</p>
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 py-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#003d7a]" /> Secure shopping with BretuneTech
        </p>
      </div>
    </div>

    {/* ══ DESKTOP LAYOUT ══ */}
    <div className="hidden sm:block min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2" />
          <Link href="/account" className="hover:text-gray-700">Account</Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2" />
          <span className="text-gray-900">Orders</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          My Orders ({orders.length})
        </h1>

        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Order #{order.orderNumber}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {getStatusIcon(order.status)}
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => (
                  <div key={index} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-600">
                  Total: <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                </p>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center"
                >
                  View Details
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
