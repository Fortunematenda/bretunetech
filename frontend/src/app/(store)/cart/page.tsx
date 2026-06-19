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
    standardFee: 99,
    freeShippingThreshold: 1500,
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
    <div className="w-full px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{itemCount()} item{itemCount() !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={clearCart} className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 sm:p-5 flex gap-3 sm:gap-4 shadow-sm">
              {/* Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
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
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                ) : (
                  <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-[#003d7a]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {item.type === 'bundle' && (
                      <span className="text-[10px] sm:text-xs text-orange-500 font-medium">Bretunetech Kit</span>
                    )}
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                    {item.warehouseLocation && (
                      <span className={`inline-flex items-center gap-1 mt-0.5 sm:mt-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border ${
                        item.warehouseLocation === 'CPT' ? 'bg-green-50 border-green-200 text-green-700' :
                        item.warehouseLocation === 'JHB' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        'bg-orange-50 border-orange-200 text-orange-700'
                      }`}>
                        <Truck className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                          item.warehouseLocation === 'CPT' ? 'text-green-500' :
                          item.warehouseLocation === 'JHB' ? 'text-blue-500' : 'text-orange-500'
                        }`} />
                        <span className="hidden sm:inline">Dispatches from {item.warehouseLocation === 'CPT' ? 'Cape Town' : item.warehouseLocation === 'JHB' ? 'Johannesburg' : 'Durban'}</span>
                        <span className="sm:hidden">{item.warehouseLocation}</span>
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1 sm:p-1.5 text-gray-500 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2 sm:mt-3">
                  <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-l-lg transition-colors">
                      <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                    </button>
                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm text-gray-900 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-r-lg transition-colors">
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-[#003d7a]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:sticky lg:top-24 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Shipping
                </span>
                <span className="text-gray-900">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </div>
              {shippingSettings.enableFreeShipping && shippingCost > 0 && (
                <p className="text-[10px] sm:text-xs text-gray-400">
                  Free shipping on orders over {formatPrice(shippingSettings.freeShippingThreshold)}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between">
                <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                <span className="text-base sm:text-lg font-bold text-[#003d7a]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-[#003d7a] hover:bg-blue-800 text-white text-sm sm:text-base font-medium rounded-xl transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            <Link href="/products" className="block text-center text-xs sm:text-sm text-gray-500 hover:text-gray-900 mt-3 sm:mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
