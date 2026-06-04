'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const brands = [
  { name: 'Ubiquiti', logo: '/assets/brands/ubiquiti.png' },
  { name: 'MikroTik', logo: 'https://mikrotik.com/logo/assets/logo-gray-Rw9HX79t.svg' },
  { name: 'Dell', logo: 'https://www.dellonline.co.za/cdn/shop/files/dell-logo-blue_200x.svg?v=1775549413' },
  { name: 'Lenovo', logo: 'https://www.lenovo-online.co.za/cdn/shop/files/lenovo-logo-hiresolution.png?v=1655730019&width=280' },
  { name: 'Reyee', logo: 'https://eo-sgp-cos.ruijie.com/site_style/new_navs/fer/upimg/logo.svg' },
  { name: 'Cudy', logo: 'https://www.cudy.com/cdn/shop/files/cudy-logo-black.png?v=1700658757&width=140' },
  { name: 'Linkbasic', logo: 'https://www.linkbasic.us/template/en/images/logo.png' },
  { name: 'Hubble', logo: 'https://static.wixstatic.com/media/a9e29e_3d02e58346d1448196cbc401d89a7096~mv2.png/v1/fill/w_412,h_246,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a9e29e_3d02e58346d1448196cbc401d89a7096~mv2.png' },
  { name: 'Must', logo: '/assets/brands/must.png' },
  { name: 'Mecer', logo: 'https://mecer.co.za/wp-content/uploads/2023/05/Logo-white-1.png' },
];

export default function BrandLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

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
        className="flex items-center gap-4 overflow-x-hidden flex-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="shrink-0 h-8 opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center
              w-1/3 sm:w-1/4 md:w-1/5 lg:w-[12.5%]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-full w-auto object-contain max-w-[100px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-sm font-bold text-gray-500 tracking-wide whitespace-nowrap">${brand.name}</span>`;
                }
              }}
            />
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
