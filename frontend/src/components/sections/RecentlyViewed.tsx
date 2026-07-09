'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

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
  const { user } = useAuthStore();
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);

  useEffect(() => {
    const rvKey = `recentlyViewed_${user?.id ?? 'guest'}`;

    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(rvKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProducts(parsed.slice(0, 10));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      }
    };

    loadRecentlyViewed();

    const handleStorageChange = () => loadRecentlyViewed();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

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
    const rvKey = `recentlyViewed_${user?.id ?? 'guest'}`;
    localStorage.removeItem(rvKey);
    setProducts([]);
  };

  if (products.length === 0) {
    return null; // Don't show section if no recently viewed products
  }

  return (
    <section className="py-5 px-4 sm:px-6 lg:px-8 bg-blue-50/50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#003d7a]" />
              <h2 className="text-lg font-bold text-[#003d7a]">Pick Up Where You Left Off</h2>
            </div>
            <p className="text-xs text-gray-500 ml-6">Recently viewed products</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:text-[#003d7a] hover:border-[#003d7a] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto pb-2"
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
                className="shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="bg-white rounded-lg p-2.5 border border-gray-200 hover:shadow-md hover:border-[#003d7a] transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-white rounded-md mb-2 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white">
                        <Clock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Name */}
                  <h4 className="text-xs font-medium text-gray-900 mb-1.5 line-clamp-2 group-hover:text-[#003d7a] transition-colors min-h-[2rem]">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <p className="text-sm font-bold text-[#003d7a]">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-gray-400 line-through whitespace-nowrap">{formatPrice(product.originalPrice)}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{getShippingText(product)}</p>
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
