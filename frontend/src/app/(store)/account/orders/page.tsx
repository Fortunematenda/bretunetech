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
          <SignInButton className="text-[#003d7a] hover:underline">Login</SignInButton>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003d7a]" />
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">My Orders</h1>

          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-[#e6f0ff] p-4 sm:p-6 rounded-full">
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
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-[#003d7a] hover:bg-blue-700 transition-colors"
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
    <div className="md:hidden bg-gray-50 min-h-screen pb-24">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <Link href="/account/settings" aria-label="Go back" className="text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
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
    <main className="hidden md:block min-h-screen bg-slate-50">
      <section className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
              <p className="text-slate-500 mt-2">
                {orders.length} order{orders.length !== 1 ? 's' : ''} in your account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-xl font-semibold text-slate-900 mt-2">{orders.length}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Processing</p>
              <p className="text-xl font-semibold text-[#003d7a] mt-2">{orders.filter(o => ['PENDING', 'PAID', 'PROCESSING'].includes(o.status)).length}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Delivered</p>
              <p className="text-xl font-semibold text-green-600 mt-2">{orders.filter(o => o.status === 'COMPLETED').length}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-xl font-semibold text-blue-700 mt-2">
                {formatPrice(orders.filter(o => o.status !== 'CANCELLED').reduce((sum, order) => sum + order.totalPrice, 0))}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by product or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-10 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />

              <select 
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Orders</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
              <div className="w-20 h-20 rounded-full bg-[#e6f0ff] flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-[#003d7a]" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">No orders found</h2>
              <p className="text-sm text-slate-500 mt-2">
                {activeFilter === 'All' && !searchQuery ? 'Start shopping to see your orders here!' : 'Try adjusting your search or filter.'}
              </p>

              {activeFilter === 'All' && !searchQuery && (
                <Link
                  href="/products"
                  className="inline-flex mt-6 h-11 px-6 rounded-xl bg-[#003d7a] text-white font-bold items-center justify-center"
                >
                  Browse Products
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="relative bg-white h-48 flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      {order.items[0]?.product?.images?.[0]?.url ? (
                        <img
                          src={order.items[0].product.images[0].url}
                          alt={order.items[0].name}
                          className="w-full h-full object-contain p-6"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-slate-300" />
                      )}
                    </div>

                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <p className="text-sm text-slate-500">Order #{order.orderNumber}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</p>
                    </div>

                    <div className="mt-3 flex items-end gap-2">
                      <p className="text-base font-semibold text-blue-700">{formatPrice(order.totalPrice)}</p>
                      <p className="text-xs text-slate-500 mb-0.5">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="h-9 w-full rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors bg-[#003d7a] hover:bg-blue-700 text-white"
                      >
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
    </>
  );
}
