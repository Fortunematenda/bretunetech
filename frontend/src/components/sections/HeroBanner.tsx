'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchActiveAds } from '@/lib/ads-cache';
import { isBot } from '@/lib/is-bot';

/* ── Default fallback slides ───────────────────────────────── */
const DEFAULT_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #1a56db 0%, #1e40af 60%, #1e3a8a 100%)',
    promoLine1: 'Shop Top',
    promoLine2: 'Networking',
    promoTag: 'Deals',
    cta: 'Shop Now',
    ctaLink: '/products?category=internet-networking',
    category: 'internet-networking',
  },
  {
    bg: 'linear-gradient(135deg, #d97706 0%, #b45309 60%, #92400e 100%)',
    promoLine1: 'Beat Load',
    promoLine2: 'Shedding',
    promoTag: 'Power Solutions',
    cta: 'Shop Now',
    ctaLink: '/products?category=power-solutions',
    category: 'power-solutions',
  },
  {
    bg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 60%, #155e75 100%)',
    promoLine1: 'Protect Your',
    promoLine2: 'Property',
    promoTag: 'CCTV & Security',
    cta: 'Shop Now',
    ctaLink: '/products?category=cameras',
    category: 'cameras',
  },
];

const SLIDE_DURATION = 6000;

/* ── Floating product images ───────────────────────────────── */
function FloatingProducts({ category, side, pinnedProducts }: {
  category: string;
  side: 'left' | 'right';
  pinnedProducts?: Array<{ id: string; name: string; image: string; slug: string }>;
}) {
  const [fetched, setFetched] = useState<any[]>([]);

  useEffect(() => {
    if (pinnedProducts && pinnedProducts.length > 0) { setFetched([]); return; }
    if (!category || isBot()) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/products?category=${encodeURIComponent(category)}&limit=3`)
      .then((r) => r.ok ? r.json() : {} as any)
      .then((d: any) => setFetched((d.products || d.data || []).slice(0, 3)))
      .catch(() => {});
  }, [category, pinnedProducts]);

  /* Build a unified product list: pinned > fetched > placeholders */
  const resolved: Array<{ id?: string; name: string; image: string; slug?: string } | null> =
    pinnedProducts && pinnedProducts.length > 0
      ? pinnedProducts.map(p => ({ id: p.id, name: p.name, image: p.image, slug: p.slug }))
      : fetched.length > 0
        ? fetched.map(p => ({ id: p.id, name: p.name, image: p.images?.[0]?.url || '', slug: p.slug }))
        : [];

  const items: Array<{ id?: string; name: string; image: string; slug?: string } | null> =
    resolved.length > 0 ? resolved : Array(3).fill(null);

  /* stagger offsets so images overlap/fan out like the reference */
  const offsets =
    side === 'left'
      ? ['rotate-[-8deg] translate-y-2', 'rotate-[0deg] translate-y-0 z-10', 'rotate-[6deg] translate-y-3']
      : ['rotate-[8deg] translate-y-3', 'rotate-[0deg] translate-y-0 z-10', 'rotate-[-6deg] translate-y-2'];

  return (
    <div className={`flex items-end gap-1 ${side === 'left' ? 'justify-start pl-2' : 'justify-end pr-2'}`}>
      {items.map((p, i) => (
        <Link
          key={p?.id ?? i}
          href={p ? `/products/${p.slug ?? ''}` : '#'}
          className={`relative shrink-0 w-[100px] sm:w-[120px] lg:w-[140px] aspect-square transition-transform duration-300 hover:scale-105 ${offsets[i]}`}
        >
          {p?.image ? (
            <img
              src={p.image}
              alt={p.name ?? ''}
              loading="lazy"
              draggable={false}
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          ) : (
            /* Ghost placeholder while loading */
            <div className="w-full h-full rounded-2xl bg-white/10 animate-pulse" />
          )}
        </Link>
      ))}
    </div>
  );
}

const CACHE_KEY = 'hero_slides_cache';

function loadCached(): any[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length) return p; }
  } catch {}
  return DEFAULT_SLIDES;
}

/* ── Main banner ───────────────────────────────────────────── */
const HeroBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [slides, setSlides] = useState<any[]>(() => loadCached());
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Refs so interval callback never goes stale */
  const idxRef = useRef(0);
  const slidesRef = useRef(slides);
  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { slidesRef.current = slides; }, [slides]);

  /* After mount: fetch fresh from API in background */
  useEffect(() => {
    setMounted(true);
    if (isBot()) return;
    /* Fetch fresh slides in background (shared fetch — no duplicate requests) */
    fetchActiveAds()
      .then((ads: any[]) => {
        const hero = ads.find((a: any) => a.type === 'hero' && Array.isArray(a.heroSlides) && a.heroSlides.length > 0);
        if (hero?.heroSlides?.length) {
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(hero.heroSlides)); } catch {}
          setSlides(hero.heroSlides);
        }
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback((n: number) => { setIdx(n); }, []);
  const next = useCallback(() => goTo((idxRef.current + 1) % slidesRef.current.length), [goTo]);
  const prev = useCallback(() => goTo((idxRef.current - 1 + slidesRef.current.length) % slidesRef.current.length), [goTo]);

  /* Auto-rotate — start once on mount, never restart */
  useEffect(() => {
    timerRef.current = setInterval(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slide = slides[idx] ?? DEFAULT_SLIDES[0];

  if (!mounted) {
    return (
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: 'clamp(260px, 32vw, 360px)' }}
      />
    );
  }

  return (
    <div className="relative w-full overflow-hidden select-none" style={{ height: 'clamp(260px, 32vw, 360px)' }}>
      {/* ── Background layers — one per slide, crossfade between them ── */}
      {slides.map((s: any, i: number) => {
        const bg = s.bg || DEFAULT_SLIDES[0].bg;
        const isImage = bg.startsWith('http') || bg.startsWith('url(') || bg.startsWith('/');
        return (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 bg-cover bg-center"
            style={{
              ...(isImage ? { backgroundImage: bg.startsWith('url(') ? bg : `url(${bg})` } : { background: bg }),
              opacity: i === idx ? 1 : 0,
              zIndex: 0
            }}
          />
        );
      })}

      {/* Content layer */}
      <div className="relative z-10 flex items-center justify-between w-full h-full">
        {/* ── Left product images ── */}
        <div className="flex items-end self-end h-full overflow-hidden w-[140px] sm:w-[220px] lg:w-[300px] shrink-0">
          <FloatingProducts
            category={slide.category}
            side="left"
            pinnedProducts={slide.pinnedProductsLeft || slide.pinnedProducts}
          />
        </div>

        {/* ── Centre promo text ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-2 z-20">
          <p
            className="text-xs sm:text-sm font-semibold uppercase tracking-widest"
            style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            {slide.promoLine1}
          </p>
          <h1
            className="font-black leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.45)' }}
          >
            {slide.promoLine2}
          </h1>
          <span
            className="inline-block px-3 py-0.5 rounded font-bold text-xs sm:text-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            {slide.promoTag}
          </span>
          <Link
            href={slide.ctaLink || '/products'}
            className="mt-1 inline-block px-5 py-2 rounded-lg font-bold text-sm bg-white hover:bg-white/90 transition-all shadow-lg"
            style={{ color: '#1e3a8a' }}
          >
            {slide.cta || 'Shop Now'} →
          </Link>
        </div>

        {/* ── Right product images ── */}
        <div className="flex items-end self-end h-full overflow-hidden w-[140px] sm:w-[220px] lg:w-[300px] shrink-0">
          <FloatingProducts
            category={slide.categoryRight || slide.category}
            side="right"
            pinnedProducts={slide.pinnedProductsRight || slide.pinnedProducts}
          />
        </div>
      </div>

      {/* ── Dot navigation (bottom-right like reference) ── */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
        {slides.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? '20px' : '8px',
              height: '8px',
              backgroundColor: i === idx ? '#ffffff' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
};

export default HeroBanner;
