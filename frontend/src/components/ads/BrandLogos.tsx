'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { brandsApi } from '@/lib/api';
import Link from 'next/link';

export default function BrandLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    brandsApi.list()
      .then((data) => setBrands(Array.isArray(data) ? data.filter((b: any) => b.isActive !== false) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getSlotWidth = () => {
    if (!scrollRef.current) return 120;
    const w = scrollRef.current.offsetWidth;
    if (window.innerWidth < 480) return w / 3;
    if (window.innerWidth < 768) return w / 4;
    if (window.innerWidth < 1024) return w / 5;
    return w / 7;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -getSlotWidth() : getSlotWidth(), behavior: 'smooth' });
    }
  };

  // Auto-scroll on all screen sizes
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current || !scrollRef.current) return;
      const el = scrollRef.current;
      const atEnd = el.scrollLeft + el.offsetWidth >= el.scrollWidth - 2;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: getSlotWidth(), behavior: 'smooth' });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const BrandItem = ({ brand }: { brand: any }) => (
    <Link
      href={`/products?brand=${brand.slug}`}
      className={`shrink-0 flex items-center justify-center px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors ${
        isMobile ? 'w-[calc(100%/3.5)]' : 'w-24 sm:w-28 md:w-32 lg:w-36'
      }`}
      style={{ minWidth: isMobile ? 80 : undefined, maxWidth: isMobile ? 140 : undefined }}
      title={brand.name}
    >
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className="h-8 w-auto object-contain"
          style={{ maxWidth: '100%' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span style="font-size:11px;font-weight:700;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;display:block;text-align:center">${brand.name}</span>`;
            }
          }}
        />
      ) : (
        <span className="text-xs font-bold text-gray-500 text-center leading-tight line-clamp-2">{brand.name}</span>
      )}
    </Link>
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Desktop arrow buttons */}
      {!isMobile && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] shadow-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className={`flex items-center gap-1 ${
          isMobile
            ? 'overflow-x-auto scrollbar-none'   // native swipe on mobile
            : 'overflow-x-hidden mx-8'            // hidden + arrows on desktop
        }`}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
        }}
      >
        {brands.map((brand) => (
          <div key={brand.id || brand.name} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <BrandItem brand={brand} />
          </div>
        ))}
      </div>

      {/* Desktop arrow buttons */}
      {!isMobile && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] shadow-sm transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

    </div>
  );
}
