'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package, Tag, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { publicApi } from '@/lib/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();
  const cartTotal = total();
  
  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    standardFee: 150,
    freeShippingThreshold: 1000,
    enableFreeShipping: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch shipping settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await publicApi.getShippingSettings();
        if (settings) {
          setShippingSettings(settings);
        }
      } catch {
        // Use defaults if API fails
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  // Calculate shipping
  const shippingCost = shippingSettings.enableFreeShipping && cartTotal >= shippingSettings.freeShippingThreshold 
    ? 0 
    : shippingSettings.standardFee;
  const grandTotal = cartTotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Add some products or bundles to get started.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#003d7a] hover:bg-blue-800 text-white font-medium rounded-xl transition-colors">
            Browse Products
          </Link>
          <Link href="/bundles" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors">
            View Bundles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{itemCount()} item{itemCount() !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex gap-4 shadow-sm">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    width={80} 
                    height={80} 
                    unoptimized
                    className="w-full h-full object-contain p-1" 
                  />
                ) : item.type === 'bundle' ? (
                  <Package className="w-8 h-8 text-orange-500" />
                ) : (
                  <Tag className="w-8 h-8 text-[#003d7a]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {item.type === 'bundle' && (
                      <span className="text-xs text-orange-500 font-medium">VoltNet Kit</span>
                    )}
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors">
                      <Minus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm text-gray-900 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors">
                      <Plus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-lg font-bold text-[#003d7a]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Shipping
                </span>
                <span className="text-gray-900">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </div>
              {shippingSettings.enableFreeShipping && shippingCost > 0 && (
                <p className="text-xs text-gray-400">
                  Free shipping on orders over {formatPrice(shippingSettings.freeShippingThreshold)}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-[#003d7a]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#003d7a] hover:bg-blue-800 text-white font-medium rounded-xl transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
