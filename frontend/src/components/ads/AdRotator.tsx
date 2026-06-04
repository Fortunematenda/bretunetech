'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

const ads: AdItem[] = [
  {
    id: '1',
    title: 'Free Delivery Nationwide',
    subtitle: 'On all orders over R1,000. Shop now and save!',
    cta: 'Shop Now',
    href: '/products',
  },
  {
    id: '2',
    title: 'Flash Sale: Up to 30% Off',
    subtitle: 'Limited time deals on laptops, UPS units & networking gear',
    cta: 'View Deals',
    href: '/products?sale=true',
  },
  {
    id: '3',
    title: 'New Arrivals Just Landed',
    subtitle: 'Latest load shedding solutions and tech accessories now in stock',
    cta: 'Explore',
    href: '/products?new=true',
  },
  {
    id: '4',
    title: 'Bundle & Save More',
    subtitle: 'Complete home office kits at unbeatable prices. Shop VoltNet Kits!',
    cta: 'View Bundles',
    href: '/bundles',
  },
];

export default function AdRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentAd = ads[currentIndex];

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="relative w-full bg-gradient-to-r from-orange-500 to-yellow-500 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full-width banner container - Takealot style */}
      <div className="relative w-full h-[50px] sm:h-[60px]">
        
        {/* Content container */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          
          {/* Main content - centered like Takealot */}
          <div className="flex items-center gap-3 sm:gap-6 text-center">
            <div>
              <span className="text-white font-bold text-sm sm:text-base">
                {currentAd.title}
              </span>
              <span className="text-white/80 text-xs sm:text-sm ml-2 sm:ml-3">
                {currentAd.subtitle}
              </span>
            </div>
            
            <Link
              href={currentAd.href}
              className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-[#0074D9] text-xs sm:text-sm font-bold rounded-sm hover:bg-gray-100 transition-colors"
            >
              {currentAd.cta}
            </Link>
          </div>

          {/* Close button - right side */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle dot indicators at bottom */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/40 w-1 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
