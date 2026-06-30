'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingDown, Zap, Check, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { bundlesApi } from '@/lib/api';

export default function BundlesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
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

  const addBundle = (bundle: any) => {
    addItem({ bundleId: bundle.id, name: bundle.name, price: bundle.bundlePrice, quantity: 1, type: 'bundle', image: bundle.imageUrl || '' });
    setToastMessage(`${bundle.name} added to cart`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const categories = ['All', ...Array.from(new Set(bundles.map((b) => b.category?.name).filter(Boolean)))] as string[];
  const visibleBundles = activeCategory === 'All' ? bundles : bundles.filter((b) => b.category?.name === activeCategory);
  const badgeFor = (i: number) => (i === 0 ? { label: 'Best Seller', cls: 'bg-[#003d7a] text-white' } : i === 1 ? { label: 'Great Value', cls: 'bg-green-500 text-white' } : { label: 'Top Pick', cls: 'bg-purple-500 text-white' });

  return (
    <>
    {/* ══ MOBILE LAYOUT (Image 5) ══ */}
    <div className="sm:hidden bg-gray-50 min-h-screen pb-24">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold text-gray-900">Bundles</h1>
        <button aria-label="Filter" className="text-gray-700"><SlidersHorizontal className="w-5 h-5" /></button>
      </div>

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                activeCategory === c ? 'bg-blue-50 border-[#003d7a] text-[#003d7a]' : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <Package className="w-4 h-4" /> {c}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="px-4 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-white border border-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!loading && visibleBundles.length === 0 && (
        <div className="text-center py-20 px-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No bundles available yet.</p>
        </div>
      )}

      <div className="px-4 space-y-4">
        {!loading && visibleBundles.map((bundle, bi) => {
          const itemsTotal = (bundle.items || []).reduce((s: number, i: any) => s + (i.product?.sellingPrice || 0) * (i.quantity || 1), 0);
          const savings = itemsTotal > bundle.bundlePrice ? itemsTotal - bundle.bundlePrice : 0;
          const badge = badgeFor(bi % 3);
          const thumbs = (bundle.items || []).slice(0, 3);
          const extra = (bundle.items || []).length - thumbs.length;
          return (
            <div key={bundle.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 gap-3 p-3">
                {/* Left: image + thumbnails + view */}
                <div>
                  <div className="relative bg-gray-50 rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                    <span className={`absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.cls}`}>{badge.label}</span>
                    {bundle.imageUrl
                      ? <img src={bundle.imageUrl} alt={bundle.name} className="w-full h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : <Package className="w-10 h-10 text-gray-300" />}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {thumbs.map((it: any, idx: number) => (
                      <div key={idx} className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        {it.product?.images?.[0]?.url
                          ? <img src={it.product.images[0].url} alt="" className="w-full h-full object-contain p-0.5" />
                          : <Zap className="w-3 h-3 text-gray-300" />}
                      </div>
                    ))}
                    {extra > 0 && <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-500">+{extra}</div>}
                  </div>
                  <Link href={`/bundles/${bundle.slug || bundle.id}`} className="mt-2 w-full flex items-center justify-center py-2 rounded-lg border border-[#003d7a] text-[#003d7a] text-[11px] font-semibold">
                    View Bundle
                  </Link>
                </div>

                {/* Right: details */}
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-gray-900 leading-snug">{bundle.name}</h2>
                  {bundle.description && <p className="text-[11px] text-gray-400 leading-snug mt-0.5 line-clamp-2">{bundle.description}</p>}
                  <span className="inline-flex items-center gap-1 self-start mt-2 px-2 py-0.5 bg-blue-50 text-[#003d7a] text-[10px] font-semibold rounded-md">
                    <Package className="w-3 h-3" /> {(bundle.items || []).length} Items Included
                  </span>
                  <ul className="mt-2 space-y-1">
                    {(bundle.items || []).slice(0, 5).map((it: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-1 text-[11px] text-gray-600 leading-tight">
                        <Check className="w-3 h-3 text-[#003d7a] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{it.product?.name || it.name}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      {savings > 0 && <span className="text-[11px] text-gray-400 line-through">{formatPrice(itemsTotal)}</span>}
                      {savings > 0 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Save {formatPrice(savings)}</span>}
                    </div>
                    <p className="text-lg font-bold text-[#003d7a]">{formatPrice(bundle.bundlePrice)}</p>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={() => addBundle(bundle)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#003d7a] text-white text-xs font-semibold rounded-xl"
                >
                  <ShoppingCart className="w-4 h-4" /> Add Bundle to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* ══ DESKTOP LAYOUT ══ */}
    <div className="hidden sm:block w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto">
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

    </div>

    {/* Toast Notification */}
    {showToast && (
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in slide-in-from-bottom-4 bg-green-600 text-white">
        <Check className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">{toastMessage}</p>
          <p className="text-xs opacity-80">Go to <a href="/cart" className="underline">cart</a> to checkout</p>
        </div>
      </div>
    )}
    </>
  );
}
