'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { brandsApi } from '@/lib/api';

export default function BrandLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    brandsApi.list()
      .then((data) => setBrands(Array.isArray(data) ? data.filter((b: any) => b.isActive !== false) : []))
      .catch(() => {});
  }, []);

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 8;
    if (window.innerWidth < 480) return 3;
    if (window.innerWidth < 768) return 4;
    if (window.innerWidth < 1024) return 5;
    return 8;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const slotWidth = scrollRef.current.offsetWidth / getVisibleCount();
      scrollRef.current.scrollBy({ left: dir === 'left' ? -slotWidth : slotWidth, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current || !scrollRef.current) return;
      const el = scrollRef.current;
      const slotWidth = el.offsetWidth / getVisibleCount();
      const atEnd = el.scrollLeft + el.offsetWidth >= el.scrollWidth - 2;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: slotWidth, behavior: 'smooth' });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <button
        onClick={() => scroll('left')}
        className="shrink-0 w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-hidden flex-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {brands.map((brand) => (
          <div
            key={brand.id || brand.name}
            className="shrink-0 h-10 cursor-pointer flex items-center justify-center
              w-24 sm:w-28 md:w-32 lg:w-36"
            style={{ scrollSnapAlign: 'start' }}
          >
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-auto object-contain max-w-[120px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-sm font-bold text-gray-500 tracking-wide whitespace-nowrap">${brand.name}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-sm font-bold text-gray-500 tracking-wide whitespace-nowrap">{brand.name}</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="shrink-0 w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
