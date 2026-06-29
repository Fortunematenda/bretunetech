'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Star, Zap, ArrowRight, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart-store';

/* ─── Types ────────────────────────────────────────── */
interface Category { id: string; name: string; slug: string; imageUrl?: string; }
interface Brand { id: string; name: string; slug: string; logoUrl?: string; }
interface FeaturedProduct {
  id: string; slug: string; name: string; price: number;
  originalPrice?: number; image: string; badge?: string;
  stock: 'in' | 'low' | 'out'; shipsToday?: boolean; shippingDays?: number;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  featuredProducts: FeaturedProduct[];
}

/* ─── Category icons ───────────────────────────────── */
const catIconMap: Record<string, { icon: string; color: string }> = {
  'networking': { icon: '🌐', color: 'from-blue-500 to-blue-600' },
  'wifi':       { icon: '📶', color: 'from-cyan-500 to-cyan-600' },
  'cctv':       { icon: '📷', color: 'from-purple-500 to-purple-600' },
  'cameras':    { icon: '📷', color: 'from-purple-500 to-purple-600' },
  'power':      { icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  'accessories':{ icon: '🔗', color: 'from-gray-500 to-gray-600' },
  'cables':     { icon: '🔗', color: 'from-gray-500 to-gray-600' },
  'switches':   { icon: '🔌', color: 'from-green-500 to-green-600' },
  'routers':    { icon: '📶', color: 'from-cyan-500 to-cyan-600' },
  'default':    { icon: '📦', color: 'from-indigo-500 to-indigo-600' },
};

function getCatMeta(slug: string, name: string) {
  const lower = slug.toLowerCase();
  if (catIconMap[lower]) return catIconMap[lower];
  const n = name.toLowerCase();
  if (n.includes('network')) return catIconMap['networking'];
  if (n.includes('wifi') || n.includes('router')) return catIconMap['wifi'];
  if (n.includes('cctv') || n.includes('camera')) return catIconMap['cctv'];
  if (n.includes('power') || n.includes('ups')) return catIconMap['power'];
  if (n.includes('switch')) return catIconMap['switches'];
  if (n.includes('cable') || n.includes('accessor')) return catIconMap['accessories'];
  return catIconMap['default'];
}

/* ─── Compact product card for 2-col grid ─────────── */
function MobileProductCard({ product }: { product: FeaturedProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, type: 'product', image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.slug}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform">
        {/* Image */}
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
          />
          {discountPct && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.badge && !discountPct && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {product.badge}
            </span>
          )}
          {product.stock === 'out' && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-red-500 bg-white px-2 py-1 rounded-lg border border-red-200">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="text-[11px] text-gray-500 mb-0.5 line-clamp-1">{product.badge || (product.shipsToday ? 'In Stock' : '')}</p>
          <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1.5">{product.name}</p>

          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <p className="text-sm font-bold text-[#003d7a]">{formatPrice(product.price)}</p>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 'out'}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                added
                  ? 'bg-green-500 text-white'
                  : product.stock === 'out'
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-[#003d7a] text-white active:bg-blue-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Hero Slider ──────────────────────────────────── */
function MobileHeroSlider({ products }: { products: FeaturedProduct[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slides = products.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const discountPct = slide.originalPrice && slide.originalPrice > slide.price
    ? Math.round(((slide.originalPrice - slide.price) / slide.originalPrice) * 100)
    : null;

  return (
    <div className="mx-3 mb-4">
      <Link href={`/products/${slide.slug}`}>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#003d7a] to-[#0055a4] min-h-[185px] flex">
          {/* Text side */}
          <div className="flex-1 p-4 flex flex-col justify-between z-10">
            <div>
              <span className="inline-block bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                {slide.badge || (slide.shipsToday ? '✦ In Stock' : '✦ Featured')}
              </span>
              <h2 className="text-white font-bold text-sm leading-tight line-clamp-3 mb-1">
                {slide.name}
              </h2>
              {discountPct && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-blue-200 line-through">{formatPrice(slide.originalPrice!)}</span>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">-{discountPct}%</span>
                </div>
              )}
              <p className="text-orange-400 font-extrabold text-lg">{formatPrice(slide.price)}</p>
            </div>
            <span className="inline-flex items-center gap-1 bg-white text-[#003d7a] text-[11px] font-bold px-3 py-1.5 rounded-full self-start">
              Shop Now <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Image side */}
          <div className="w-[45%] shrink-0 relative">
            <img
              src={slide.image}
              alt={slide.name}
              className="absolute inset-0 w-full h-full object-contain p-3"
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
            />
          </div>

          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#003d7a]/20 to-transparent pointer-events-none" />
        </div>
      </Link>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-[#003d7a]' : 'w-1.5 h-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Section Header ───────────────────────────────── */
function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <Link href={href} className="flex items-center gap-0.5 text-[11px] font-semibold text-[#003d7a]">
        View all <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────── */
export default function MobileHomePage({ categories, brands, featuredProducts }: Props) {
  const [dealProducts, setDealProducts] = useState<FeaturedProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    // Load recently viewed from localStorage
    try {
      const stored = localStorage.getItem(`recentlyViewed_guest`);
      if (stored) {
        const rv = JSON.parse(stored);
        setRecentlyViewed(rv.slice(0, 6));
      }
    } catch {}

    // Fetch deals
    productsApi.list({ limit: '20' }).then((data: any) => {
      const discounted = (data.products || [])
        .filter((p: any) => p.originalPrice && p.originalPrice > p.sellingPrice)
        .sort((a: any, b: any) => {
          const dA = ((a.originalPrice - a.sellingPrice) / a.originalPrice) * 100;
          const dB = ((b.originalPrice - b.sellingPrice) / b.originalPrice) * 100;
          return dB - dA;
        })
        .slice(0, 6)
        .map((p: any) => ({
          id: p.id, slug: p.slug, name: p.name,
          price: p.sellingPrice, originalPrice: p.originalPrice,
          image: p.images?.[0]?.url || '/assets/placeholder.svg',
          badge: p.tags?.[0]?.tag,
          stock: p.stockQuantity > 0 ? 'in' : 'out',
          shipsToday: p.stockQuantity > 0,
        }));
      setDealProducts(discounted);
    }).catch(() => {});
  }, []);

  const heroSlides = featuredProducts.length > 0 ? featuredProducts : [];
  const displayedCategories = categories.slice(0, 10);
  const displayedBrands = brands.slice(0, 10);

  return (
    <div className="bg-gray-50 pb-24">
      {/* ── Hero Slider ── */}
      <div className="bg-white pt-3 pb-2">
        <MobileHeroSlider products={heroSlides} />
      </div>

      {/* ── Shop by Category ── */}
      {displayedCategories.length > 0 && (
        <div className="bg-white mt-2 py-4">
          <SectionHeader title="Shop by Category" href="/products" />
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {displayedCategories.map((cat) => {
              const meta = getCatMeta(cat.slug, cat.name);
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-[68px]"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-sm`}>
                    {meta.icon}
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 text-center leading-tight w-full break-words">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Featured Brands ── */}
      {displayedBrands.length > 0 && (
        <div className="bg-white mt-2 py-4">
          <SectionHeader title="Featured Brands" href="/brands" />
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {displayedBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/products?brand=${brand.slug}`}
                className="shrink-0 flex flex-col items-center gap-1.5"
              >
                <div className="w-16 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center px-2 shadow-sm">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{brand.name}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 text-center whitespace-nowrap">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <div className="bg-white mt-2 py-4">
          <SectionHeader title="Featured Products" href="/products?featured=true" />
          <div className="grid grid-cols-2 gap-2.5 px-3">
            {featuredProducts.slice(0, 6).map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="px-4 mt-4">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#003d7a] text-white text-sm font-bold rounded-xl"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Continue Shopping (Recently Viewed) ── */}
      {recentlyViewed.length > 0 && (
        <div className="bg-white mt-2 py-4">
          <SectionHeader title="Continue Shopping" href="/products" />
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {recentlyViewed.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="shrink-0 w-32">
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="w-full h-24 bg-gray-50">
                    <img
                      src={item.image || '/assets/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</p>
                    <p className="text-xs font-bold text-[#003d7a]">{formatPrice(item.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Hot Deals ── */}
      {dealProducts.length > 0 && (
        <div className="bg-white mt-2 py-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-gray-900">Hot Deals</h2>
            </div>
            <Link href="/products" className="flex items-center gap-0.5 text-[11px] font-semibold text-[#003d7a]">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 px-3">
            {dealProducts.slice(0, 6).map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* ── Trust badges ── */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: '🚚', title: 'Fast Delivery', sub: 'Nationwide shipping' },
            { icon: '🔒', title: 'Secure Payment', sub: 'SSL encrypted' },
            { icon: '🛡️', title: 'Warranty', sub: 'On all products' },
            { icon: '💬', title: 'SA Support', sub: 'Chat with us' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-[11px] font-semibold text-gray-800">{item.title}</p>
                <p className="text-[10px] text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
