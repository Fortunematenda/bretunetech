'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Zap, ArrowRight, Check, Flame, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';

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

/* ─── helpers ──────────────────────────────────────── */
const catMeta: Record<string, { icon: string; bg: string; color: string }> = {
  wifi:            { icon: '📶', bg: 'linear-gradient(135deg,#2563eb,#60a5fa)', color: '#fff' },
  routers:         { icon: '📶', bg: 'linear-gradient(135deg,#2563eb,#60a5fa)', color: '#fff' },
  networking:      { icon: '🌐', bg: 'linear-gradient(135deg,#4f46e5,#818cf8)', color: '#fff' },
  switches:        { icon: '🔌', bg: 'linear-gradient(135deg,#0d9488,#34d399)', color: '#fff' },
  cctv:            { icon: '📷', bg: 'linear-gradient(135deg,#7c3aed,#c084fc)', color: '#fff' },
  cameras:         { icon: '📷', bg: 'linear-gradient(135deg,#7c3aed,#c084fc)', color: '#fff' },
  power:           { icon: '⚡', bg: 'linear-gradient(135deg,#f59e0b,#fde68a)', color: '#fff' },
  accessories:     { icon: '🔧', bg: 'linear-gradient(135deg,#475569,#94a3b8)', color: '#fff' },
  cables:          { icon: '🔗', bg: 'linear-gradient(135deg,#475569,#94a3b8)', color: '#fff' },
  storage:         { icon: '💾', bg: 'linear-gradient(135deg,#e11d48,#fb7185)', color: '#fff' },
  'access-points': { icon: '📡', bg: 'linear-gradient(135deg,#0891b2,#67e8f9)', color: '#fff' },
};

function getCatMeta(slug: string, name: string) {
  const s = slug.toLowerCase(), n = name.toLowerCase();
  if (catMeta[s]) return catMeta[s];
  if (n.includes('wifi') || n.includes('router')) return catMeta.wifi;
  if (n.includes('network')) return catMeta.networking;
  if (n.includes('cctv') || n.includes('camera')) return catMeta.cctv;
  if (n.includes('power') || n.includes('ups')) return catMeta.power;
  if (n.includes('switch')) return catMeta.switches;
  if (n.includes('access')) return catMeta['access-points'];
  if (n.includes('storage')) return catMeta.storage;
  return { icon: '📦', bg: '#f3f4f6', color: '#4b5563' };
}

/* ─── Section Header ───────────────────────────────── */
function SH({ title, href, icon }: { title: string; href: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
      </div>
      <Link href={href} className="flex items-center gap-0.5 text-[12px] font-semibold text-[#003d7a]">
        View all <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ─── Product card (2-col) ─────────────────────────── */
function MobileProductCard({ product }: { product: FeaturedProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const inStock = product.stock !== 'out';
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, type: 'product', image: product.image });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.slug}`} className="block active:scale-[0.97] transition-transform">
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden h-full flex flex-col ${inStock ? 'border-gray-100' : 'border-gray-100 opacity-80'}`}>
        <div className="relative w-full aspect-square bg-gray-50">
          <img src={product.image} alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }} />
          {discountPct && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{discountPct}%</span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-[10px] font-bold text-red-500 bg-white/90 px-2 py-0.5 rounded-full border border-red-200">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-2.5 flex flex-col flex-1">
          <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5 flex-1">{product.name}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-[10px] text-gray-400 line-through leading-none mb-0.5">{formatPrice(product.originalPrice)}</p>
          )}
          <div className="flex items-center justify-between gap-1">
            <div>
              <p className="text-sm font-bold text-[#003d7a]">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className={`text-[9px] font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
            <button onClick={handleCart} disabled={!inStock}
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                added ? 'bg-green-500 text-white' : inStock ? 'bg-[#003d7a] text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}>
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Hero Slider with touch swipe ────────────────── */
function HeroSlider({ products }: { products: FeaturedProduct[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchX = useRef<number | null>(null);
  const slides = products.filter(p => p.stock !== 'out').slice(0, 5);
  if (slides.length === 0) return null;

  const go = useCallback((idx: number) => {
    setCurrent((idx + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => go(current + 1), 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, go, slides.length]);

  const slide = slides[current];
  const discountPct = slide.originalPrice && slide.originalPrice > slide.price
    ? Math.round(((slide.originalPrice - slide.price) / slide.originalPrice) * 100) : null;

  const gradients = [
    'from-[#003d7a] to-[#0062c4]',
    'from-[#1a237e] to-[#283593]',
    'from-[#004d40] to-[#00695c]',
    'from-[#4a148c] to-[#6a1b9a]',
    'from-[#b71c1c] to-[#c62828]',
  ];

  return (
    <div className="px-3 pt-2 pb-1">
      <Link href={`/products/${slide.slug}`}>
        <div
          className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradients[current % gradients.length]} min-h-[178px] flex`}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
        >
          {/* ── Floating live animations ── */}
          {/* Pulsing orbs */}
          <span className="absolute w-16 h-16 rounded-full bg-white/10 animate-ping" style={{ left: '10%', top: '15%', animationDuration: '3s' }} />
          <span className="absolute w-8 h-8 rounded-full bg-orange-400/20 animate-ping" style={{ left: '8%', top: '12%', animationDuration: '3s', animationDelay: '0.5s' }} />
          <span className="absolute w-10 h-10 rounded-full bg-white/10 animate-ping" style={{ right: '48%', bottom: '10%', animationDuration: '4s', animationDelay: '1s' }} />
          <span className="absolute w-6 h-6 rounded-full bg-blue-300/30 animate-ping" style={{ right: '52%', bottom: '8%', animationDuration: '4s', animationDelay: '1.5s' }} />
          {/* Floating glowing dots */}
          <span className="absolute w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_#f97316]" style={{ left: '20%', top: '30%', animation: 'float-up 4s ease-out infinite' }} />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-orange-300 shadow-[0_0_6px_#fb923c]" style={{ left: '30%', top: '60%', animation: 'float-up 5s ease-out infinite', animationDelay: '1.2s' }} />
          <span className="absolute w-1 h-1 rounded-full bg-white/80" style={{ left: '15%', top: '70%', animation: 'float-up 3.5s ease-out infinite', animationDelay: '0.6s' }} />
          {/* WiFi ripple */}
          <span className="absolute rounded-full border border-white/20" style={{ width: 40, height: 40, left: '12%', top: '55%', animation: 'wifi-ripple 2.5s ease-out infinite' }} />
          <span className="absolute rounded-full border border-white/15" style={{ width: 70, height: 70, left: '0%', top: '42%', animation: 'wifi-ripple 2.5s ease-out infinite', animationDelay: '0.4s' }} />
          <span className="absolute rounded-full border border-orange-400/20" style={{ width: 100, height: 100, left: '-12%', top: '28%', animation: 'wifi-ripple 2.5s ease-out infinite', animationDelay: '0.8s' }} />

          {/* Text */}
          <div className="flex-1 p-4 flex flex-col justify-between z-10 min-w-0">
            <div>
              <span className="inline-block bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
                {slide.badge || 'Featured'}
              </span>
              <h2 className="text-white font-bold text-[13px] leading-snug line-clamp-3 mb-1.5">{slide.name}</h2>
              {discountPct && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-white/60 line-through">{formatPrice(slide.originalPrice!)}</span>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{discountPct}%</span>
                </div>
              )}
              <p className="text-orange-300 font-extrabold text-base">{formatPrice(slide.price)}</p>
            </div>
            <span className="inline-flex items-center gap-1 bg-white text-[#003d7a] text-[11px] font-bold px-3 py-1.5 rounded-full self-start mt-2">
              Shop Now <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          {/* Image */}
          <div className="w-[42%] shrink-0 relative">
            <img src={slide.image} alt={slide.name}
              className="absolute inset-0 w-full h-full object-contain p-2"
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }} />
          </div>
          {/* Shimmer strip */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        </div>
      </Link>
      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-[#003d7a]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Continue Shopping Card (horizontal) ─────────── */
function ContinueShoppingCard({ item }: { item: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: item.id, name: item.name, price: item.price, quantity: 1, type: 'product', image: item.image });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors">
      <Link href={`/products/${item.slug}`} className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
        <img src={item.image || '/assets/placeholder.svg'} alt={item.name}
          className="w-full h-full object-contain p-1"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }} />
      </Link>
      <Link href={`/products/${item.slug}`} className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
        <p className="text-[11px] font-bold text-[#003d7a] mt-0.5">{formatPrice(item.price)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Viewed recently</p>
      </Link>
      <button onClick={handleCart}
        className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
          added ? 'bg-green-500 text-white' : 'bg-[#003d7a] text-white'
        }`}>
        {added ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
        {added ? 'Added' : 'Add'}
      </button>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────── */
export default function MobileHomePage({ categories, brands, featuredProducts }: Props) {
  const [dealProducts, setDealProducts] = useState<FeaturedProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed_guest');
      if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 5));
    } catch {}

    productsApi.list({ limit: '30' }).then((data: any) => {
      const all: any[] = data.products || [];
      const discounted = all
        .filter((p: any) => p.originalPrice && p.originalPrice > p.sellingPrice && p.stockQuantity > 0)
        .sort((a: any, b: any) => {
          const da = (a.originalPrice - a.sellingPrice) / a.originalPrice;
          const db = (b.originalPrice - b.sellingPrice) / b.originalPrice;
          return db - da;
        })
        .slice(0, 6)
        .map((p: any) => ({
          id: p.id, slug: p.slug, name: p.name,
          price: p.sellingPrice, originalPrice: p.originalPrice,
          image: p.images?.[0]?.url || '/assets/placeholder.svg',
          badge: p.tags?.[0]?.tag,
          stock: (p.stockQuantity > 0 ? 'in' : 'out') as 'in' | 'out',
          shipsToday: p.stockQuantity > 0,
        }));
      setDealProducts(discounted);
    }).catch(() => {});
  }, []);

  const displayedCategories = categories.slice(0, 12);
  const displayedBrands = brands.slice(0, 10);

  /* fallback continue-shopping from featured products */
  const continueItems = recentlyViewed.length > 0
    ? recentlyViewed
    : featuredProducts.filter(p => p.stock !== 'out').slice(0, 4).map(p => ({ ...p, image: p.image }));

  return (
    <div className="bg-gray-50 pb-24 overflow-x-hidden">

      {/* ── Hero Slider ── */}
      <div className="bg-white pb-3">
        <HeroSlider products={featuredProducts} />
      </div>

      {/* ── Shop by Category ── */}
      {displayedCategories.length > 0 && (
        <div className="bg-white mt-2 pt-4 pb-3">
          <SH title="Shop by Category" href="/products" />
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {displayedCategories.map((cat) => {
              const { icon, bg } = getCatMeta(cat.slug, cat.name);
              return (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 shrink-0 w-16">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: bg, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                    {icon}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight w-full">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Featured Brands ── */}
      {displayedBrands.length > 0 && (
        <div className="bg-white mt-2 pt-4 pb-3">
          <SH title="Featured Brands" href="/brands" />
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {displayedBrands.map((b) => (
              <Link key={b.slug} href={`/products?brand=${b.slug}`}
                className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-[72px] h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center px-2 shadow-sm">
                  {b.logoUrl
                    ? <img src={b.logoUrl} alt={b.name} className="max-w-full max-h-full object-contain" />
                    : <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{b.name}</span>
                  }
                </div>
                <span className="text-[9px] text-gray-500 text-center font-medium">{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <div className="bg-white mt-2 pt-4 pb-4">
          <SH title="Featured Products" href="/products?featured=true" />
          <div className="grid grid-cols-2 gap-2.5 px-3">
            {featuredProducts.slice(0, 6).map(p => <MobileProductCard key={p.id} product={p} />)}
          </div>
          <div className="px-4 mt-3">
            <Link href="/products"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#003d7a] text-white text-sm font-bold rounded-xl active:bg-blue-900 transition-colors">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Continue Shopping ── */}
      {continueItems.length > 0 && (
        <div className="bg-white mt-2 pt-4 pb-1">
          <SH title="Continue Shopping" href="/products" />
          <div>
            {continueItems.slice(0, 4).map((item: any) => (
              <ContinueShoppingCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── Hot Deals ── */}
      {dealProducts.length > 0 && (
        <div className="bg-white mt-2 pt-4 pb-4">
          <SH
            title="Hot Deals"
            href="/products?discount=true"
            icon={<Flame className="w-4 h-4 text-orange-500" />}
          />
          <div className="grid grid-cols-2 gap-2.5 px-3">
            {dealProducts.slice(0, 6).map(p => <MobileProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Trust badges ── */}
      <div className="bg-white mt-2 px-4 pt-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🚚', title: 'Fast Delivery', sub: 'Nationwide shipping', action: null },
            { icon: '🔒', title: 'Secure Payment', sub: 'SSL encrypted', action: null },
            { icon: '🛡️', title: 'Warranty', sub: 'On all products', action: null },
            { icon: '💬', title: 'SA Support', sub: 'Tap to chat with us', action: 'whatsapp' },
          ].map(item => (
            item.action === 'whatsapp'
              ? (
                <button
                  key={item.title}
                  onClick={() => window.dispatchEvent(new Event('open-whatsapp-chat'))}
                  className="flex items-center gap-2.5 bg-green-50 rounded-xl p-3 border border-green-200 active:bg-green-100 transition-colors text-left w-full"
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-green-800">{item.title}</p>
                    <p className="text-[10px] text-green-600">{item.sub}</p>
                  </div>
                </button>
              )
              : (
                <div key={item.title} className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-800">{item.title}</p>
                    <p className="text-[10px] text-gray-500">{item.sub}</p>
                  </div>
                </div>
              )
          ))}
        </div>
      </div>

    </div>
  );
}
