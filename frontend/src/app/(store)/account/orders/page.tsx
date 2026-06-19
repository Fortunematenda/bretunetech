'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
          <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
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
  );
}
