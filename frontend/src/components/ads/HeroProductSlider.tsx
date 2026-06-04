'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  price: number;
  href: string;
  badge?: string;
}

const heroProducts: HeroProduct[] = [
  {
    id: 'p6',
    name: 'MikroTik hAP ac3',
    tagline: 'Professional Networking',
    description: 'Dual-band WiFi 5 router with 5x Gigabit ports for your home or office',
    image: '/assets/products-pics/MikroTik-hAP-ac3-Router.jfif',
    price: 2299,
    href: '/products/mikrotik-hap-ac3',
    badge: 'Best Seller',
  },
  {
    id: 'p3',
    name: 'Mecer 1200VA UPS',
    tagline: 'Beat Load Shedding',
    description: 'Keep your devices running during power outages. 1200VA/720W with AVR protection',
    image: '/assets/products-pics/Mecer-1200VA-UPS-1.jfif',
    price: 2699,
    href: '/products/mecer-1200va-ups',
    badge: 'Essential',
  },
  {
    id: 'p5',
    name: 'Hubble AM-2 Battery',
    tagline: 'Power Storage',
    description: '5.1kWh lithium battery with 6000+ cycle life. 10-year warranty included',
    image: '/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery1.jfif',
    price: 16999,
    href: '/products/hubble-am2-51v-lithium-battery',
    badge: 'Premium',
  },
  {
    id: 'p1',
    name: 'Dell Latitude 5520',
    tagline: 'Work From Home',
    description: 'Refurbished i5 laptop with 16GB RAM, 256GB SSD. 12-month warranty',
    image: '/assets/products-pics/Refurbished-Dell-Latitude-5520-p1.jfif',
    price: 6999,
    href: '/products/refurbished-dell-latitude-5520',
    badge: 'Best Value',
  },
];

export default function HeroProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentProduct = heroProducts[currentIndex];

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % heroProducts.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  return (
    <div 
      className="relative bg-gradient-to-r from-[#003d7a] to-[#0055a4] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            {currentProduct.badge && (
              <span className="inline-block px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full mb-4">
                {currentProduct.badge}
              </span>
            )}
            <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wide mb-2">
              {currentProduct.tagline}
            </h3>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {currentProduct.name}
            </h2>
            <p className="text-blue-100 text-lg mb-6 max-w-md mx-auto md:mx-0">
              {currentProduct.description}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <span className="text-2xl md:text-3xl font-bold text-white">
                R {currentProduct.price.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Link
                href={currentProduct.href}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/products"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full backdrop-blur transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>

          {/* Product Image */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-2xl p-6 flex items-center justify-center">
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {heroProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-orange-500 w-8' 
                  : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
