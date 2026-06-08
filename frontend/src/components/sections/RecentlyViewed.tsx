'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RecentlyViewedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  discount?: number;
  shippingDays?: number;
}

const RecentlyViewed = () => {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);

  useEffect(() => {
    // Load recently viewed products from localStorage
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProducts(parsed.slice(0, 10)); // Show max 10 products
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      }
    };

    loadRecentlyViewed();

    // Listen for storage changes (in case user views products in another tab)
    const handleStorageChange = () => {
      loadRecentlyViewed();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getShippingText = (product: RecentlyViewedProduct) => {
    if (product.shippingDays === 1) return 'Ships in 1 work day';
    if (product.shippingDays === 2) return 'Ships in 1-2 work days';
    if (product.shippingDays && product.shippingDays > 2) {
      return `Ships in ${product.shippingDays - 1} - ${product.shippingDays} work days`;
    }
    return 'Ships in 3-4 work days';
  };

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 5;
    if (window.innerWidth < 480) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    return 5;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const slotWidth = scrollRef.current.offsetWidth / getVisibleCount();
      scrollRef.current.scrollBy({ left: dir === 'left' ? -slotWidth : slotWidth, behavior: 'smooth' });
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('recentlyViewed');
    setProducts([]);
  };

  if (products.length === 0) {
    return null; // Don't show section if no recently viewed products
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#003d7a]" />
            <h2 className="text-xl font-bold text-gray-900">Pick Up Where You Left Off</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => {
            const discountPercentage = product.originalPrice && product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : product.discount;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:shadow-lg hover:border-[#003d7a] transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-white rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {discountPercentage && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003d7a] transition-colors min-h-[2.5rem]">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-base font-bold text-[#003d7a]">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(product.originalPrice)}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getShippingText(product)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
