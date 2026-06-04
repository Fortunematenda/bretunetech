'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingDown, ChevronRight, Zap, Shield, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

const bundleData: Record<string, any> = {
  'work-from-home-kit': {
    id: 'b1', name: 'Work From Home Kit', slug: 'work-from-home-kit', bundlePrice: 9499, originalPrice: 10297,
    description: 'Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals. Set up your home office in minutes.',
    items: [
      { name: 'Refurbished Dell Latitude 5520', price: 6999, qty: 1, desc: 'i5, 16GB RAM, 256GB SSD' },
      { name: 'Mecer 1200VA UPS', price: 2699, qty: 1, desc: '720W line-interactive' },
      { name: 'Logitech MK270 Wireless Combo', price: 599, qty: 1, desc: 'Keyboard + Mouse' },
    ],
  },
  'load-shedding-backup-kit': {
    id: 'b2', name: 'Load Shedding Backup Kit', slug: 'load-shedding-backup-kit', bundlePrice: 23999, originalPrice: 25498,
    description: 'Beat load shedding with a powerful inverter and lithium battery combo. Keep your home or office running through any stage of load shedding.',
    items: [
      { name: 'Must 3KW Hybrid Solar Inverter', price: 8499, qty: 1, desc: '3000W with MPPT charger' },
      { name: 'Hubble AM-2 5.1kWh Lithium Battery', price: 16999, qty: 1, desc: '6000+ cycles, wall-mountable' },
    ],
  },
  'small-business-network-kit': {
    id: 'b3', name: 'Small Business Network Kit', slug: 'small-business-network-kit', bundlePrice: 4999, originalPrice: 5797,
    description: 'Professional networking setup for small businesses — router, access point, and bulk cabling for a complete network installation.',
    items: [
      { name: 'MikroTik hAP ac3 Router', price: 2299, qty: 1, desc: 'Dual-band, 5x Gigabit' },
      { name: 'Ubiquiti UniFi U6 Lite AP', price: 2199, qty: 1, desc: 'WiFi 6, PoE powered' },
      { name: 'CAT6 Network Cable 305m', price: 1299, qty: 1, desc: 'Pure copper UTP' },
    ],
  },
};

export default function BundleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const bundle = bundleData[slug];
  const addItem = useCartStore((s) => s.addItem);

  if (!bundle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Bundle Not Found</h1>
        <Link href="/bundles" className="text-blue-400 hover:text-blue-300">Back to bundles</Link>
      </div>
    );
  }

  const savings = bundle.originalPrice - bundle.bundlePrice;
  const pct = Math.round((savings / bundle.originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/bundles" className="hover:text-white">Bundles</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white">{bundle.name}</span>
      </nav>

      <div className="bg-gray-900 border border-orange-500/20 rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white">VoltNet Kit</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white">Save {pct}% — {formatPrice(savings)}</span>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-white mb-4">{bundle.name}</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl">{bundle.description}</p>

          {/* Included Items */}
          <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">What&apos;s Included ({bundle.items.length} products)</h2>
          <div className="space-y-3 mb-8">
            {bundle.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-gray-800/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.desc} — Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="text-lg font-medium text-gray-400">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Individual total:</span>
              <span className="text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-medium">Your savings:</span>
              <span className="text-green-400 font-medium">-{formatPrice(savings)}</span>
            </div>
            <div className="flex items-center justify-between text-2xl font-bold border-t border-gray-800 pt-3 mt-3">
              <span className="text-white">Bundle Price:</span>
              <span className="text-orange-400">{formatPrice(bundle.bundlePrice)}</span>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => addItem({ bundleId: bundle.id, name: bundle.name, price: bundle.bundlePrice, quantity: 1, type: 'bundle' })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white text-lg font-medium rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> Add Bundle to Cart — {formatPrice(bundle.bundlePrice)}
          </button>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-3 text-center">
              <Shield className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-400">Full Warranty</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-3 text-center">
              <Truck className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-400">Free Shipping</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-3 text-center">
              <Package className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-400">Curated Kit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
