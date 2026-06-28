'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingDown, Zap, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { bundlesApi } from '@/lib/api';

export default function BundlesPage() {
  useEffect(() => {
    document.title = 'Curated Bundles | Bretunetech';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Save more when you buy together. Each kit is hand-picked for a specific need — from remote work to load shedding backup.');
    }
  }, []);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    bundlesApi.list({ active: 'true' })
      .then((data) => setBundles(Array.isArray(data) ? data : []))
      .catch(() => setBundles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-sm text-orange-600 font-medium mb-4">
          <Package className="w-4 h-4" /> Bretunetech Kits
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Curated Bundles</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
          Save more when you buy together. Each kit is hand-picked for a specific need — from remote work to load shedding backup.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-12 bg-gray-200" />
              <div className="p-6 grid lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-16 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
                <div className="lg:col-span-2 space-y-2">
                  {[1,2,3].map((j) => <div key={j} className="h-16 bg-gray-200 rounded-xl" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && bundles.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No bundles available yet.</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon for curated kit deals.</p>
        </div>
      )}

      {/* Bundle Cards */}
      {!loading && bundles.length > 0 && (
        <div className="space-y-6">
          {bundles.map((bundle) => {
            const itemsTotal = (bundle.items || []).reduce((s: number, i: any) => s + (i.product?.sellingPrice || 0) * (i.quantity || 1), 0);
            const savings = itemsTotal > bundle.bundlePrice ? itemsTotal - bundle.bundlePrice : 0;
            const pct = itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0;

            return (
              <div key={bundle.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all">
                {/* Card header bar */}
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#003d7a] to-[#0056b3]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">Bundle Kit</span>
                  </div>
                  {pct > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
                      <TrendingDown className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white">Save {pct}% — {formatPrice(savings)}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: image + info + pricing + CTA */}
                    <div className="lg:col-span-1 flex flex-col">
                      {bundle.imageUrl && (
                        <div className="w-full aspect-video bg-gray-50 border border-gray-100 rounded-xl overflow-hidden mb-4">
                          <img
                            src={bundle.imageUrl}
                            alt={bundle.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h2>
                      <p className="text-gray-500 text-sm mb-5 flex-1">{bundle.description}</p>

                      <div className="mb-5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        {itemsTotal > bundle.bundlePrice && (
                          <span className="text-xs text-gray-400 line-through block">{formatPrice(itemsTotal)}</span>
                        )}
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(bundle.bundlePrice)}</span>
                        {savings > 0 && (
                          <span className="text-xs text-green-600 font-medium block mt-0.5">You save {formatPrice(savings)}</span>
                        )}
                      </div>

                      {items.some((i) => i.bundleId === bundle.id) ? (
                        <button
                          onClick={() => {
                            addItem({ bundleId: bundle.id, name: bundle.name, price: bundle.bundlePrice, quantity: 1, type: 'bundle', image: bundle.imageUrl || '' });
                            setToastMessage(`${bundle.name} added to cart`);
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 2500);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          <Check className="w-4 h-4" /> Add Another
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            addItem({ bundleId: bundle.id, name: bundle.name, price: bundle.bundlePrice, quantity: 1, type: 'bundle', image: bundle.imageUrl || '' });
                            setToastMessage(`${bundle.name} added to cart`);
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 2500);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#003d7a] hover:bg-[#0056b3] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add Kit to Cart
                        </button>
                      )}
                    </div>

                    {/* Right: Included items */}
                    <div className="lg:col-span-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What&apos;s Included</h3>
                      <div className="space-y-2">
                        {(bundle.items || []).map((item: any, idx: number) => {
                          const prod = item.product || {};
                          const img = prod.images?.[0]?.url || '';
                          const price = prod.sellingPrice || 0;
                          return (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                              <div className="flex items-center gap-3">
                                {img ? (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                    <img src={img} alt={prod.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                                    <Zap className="w-4 h-4 text-[#003d7a]" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{prod.name || item.name}</p>
                                  <p className="text-xs text-gray-400">Qty: {item.quantity || 1}</p>
                                </div>
                              </div>
                              {price > 0 && <span className="text-sm font-semibold text-gray-600">{formatPrice(price * (item.quantity || 1))}</span>}
                            </div>
                          );
                        })}
                      </div>
                      {itemsTotal > 0 && (
                        <>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                            <span className="text-gray-400">Individual total</span>
                            <span className={savings > 0 ? 'text-gray-400 line-through' : 'text-gray-600 font-semibold'}>{formatPrice(itemsTotal)}</span>
                          </div>
                          {savings > 0 && (
                            <div className="flex items-center justify-between text-base font-bold mt-1">
                              <span className="text-gray-700">Bundle price</span>
                              <span className="text-[#003d7a]">{formatPrice(bundle.bundlePrice)}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
                        <Check className="w-3.5 h-3.5" /> Free shipping on all bundle kits
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in slide-in-from-bottom-4 bg-green-600 text-white">
          <Check className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">{toastMessage}</p>
            <p className="text-xs opacity-80">Go to <a href="/cart" className="underline">cart</a> to checkout</p>
          </div>
        </div>
      )}
    </div>
  );
}
