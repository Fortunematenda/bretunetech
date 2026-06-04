'use client';

import Link from 'next/link';
import { Package, ShoppingCart, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

const bundles = [
  {
    id: 'b1', name: 'Work From Home Kit', slug: 'work-from-home-kit', bundlePrice: 9499, originalPrice: 10297,
    description: 'Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals.',
    items: [
      { name: 'Refurbished Dell Latitude 5520', price: 6999, qty: 1 },
      { name: 'Mecer 1200VA UPS', price: 2699, qty: 1 },
      { name: 'Logitech MK270 Wireless Combo', price: 599, qty: 1 },
    ],
  },
  {
    id: 'b2', name: 'Load Shedding Backup Kit', slug: 'load-shedding-backup-kit', bundlePrice: 23999, originalPrice: 25498,
    description: 'Beat load shedding with a powerful inverter and lithium battery combo. Keep your home or office running through any outage.',
    items: [
      { name: 'Must 3KW Hybrid Solar Inverter', price: 8499, qty: 1 },
      { name: 'Hubble AM-2 5.1kWh Lithium Battery', price: 16999, qty: 1 },
    ],
  },
  {
    id: 'b3', name: 'Small Business Network Kit', slug: 'small-business-network-kit', bundlePrice: 4999, originalPrice: 5797,
    description: 'Professional networking setup for small businesses — router, access point, and bulk cabling for a complete installation.',
    items: [
      { name: 'MikroTik hAP ac3 Router', price: 2299, qty: 1 },
      { name: 'Ubiquiti UniFi U6 Lite AP', price: 2199, qty: 1 },
      { name: 'CAT6 Network Cable 305m', price: 1299, qty: 1 },
    ],
  },
];

export default function BundlesPage() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-sm text-orange-400 font-medium mb-4">
          <Package className="w-4 h-4" /> VoltNet Kits
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Curated Bundles</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Save more when you buy together. Each kit is hand-picked for a specific need — from remote work to load shedding backup.
        </p>
      </div>

      {/* Bundle Cards */}
      <div className="space-y-8">
        {bundles.map((bundle) => {
          const savings = bundle.originalPrice - bundle.bundlePrice;
          const pct = Math.round((savings / bundle.originalPrice) * 100);

          return (
            <div key={bundle.id} className="bg-gray-900 border border-orange-500/20 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">VoltNet Kit</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-white" />
                  <span className="font-bold text-white">Save {pct}% — {formatPrice(savings)}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Info */}
                  <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold text-white mb-3">{bundle.name}</h2>
                    <p className="text-gray-400 mb-6">{bundle.description}</p>

                    <div className="mb-6">
                      <span className="text-sm text-gray-500 line-through block">{formatPrice(bundle.originalPrice)}</span>
                      <span className="text-3xl font-bold text-white">{formatPrice(bundle.bundlePrice)}</span>
                      <span className="text-sm text-green-400 font-medium block mt-1">You save {formatPrice(savings)}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => addItem({ bundleId: bundle.id, name: bundle.name, price: bundle.bundlePrice, quantity: 1, type: 'bundle' })}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" /> Add Kit to Cart
                      </button>
                    </div>
                  </div>

                  {/* Included items */}
                  <div className="lg:col-span-2">
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">What&apos;s Included</h3>
                    <div className="space-y-3">
                      {bundle.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-800/50 border border-gray-800 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                              <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-400">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm border-t border-gray-800 pt-4">
                      <span className="text-gray-400">Individual total:</span>
                      <span className="text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span className="text-white">Bundle price:</span>
                      <span className="text-orange-400">{formatPrice(bundle.bundlePrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
