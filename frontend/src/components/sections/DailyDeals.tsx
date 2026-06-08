'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { productsApi } from '@/lib/api';

interface DealProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
}

const DailyDeals = () => {
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await productsApi.list({ limit: '50' });
        if (response.products && response.products.length > 0) {
          // Filter products with original price (discounted items)
          const discountedProducts = response.products
            .filter((product: any) => product.originalPrice && product.originalPrice > product.sellingPrice)
            .map((product: any) => ({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.sellingPrice,
              originalPrice: product.originalPrice,
              image: product.images?.[0]?.url || '/assets/placeholder.svg',
              shippingDays: product.shippingDays || 3,
            }))
            // Sort by discount percentage (highest first)
            .sort((a, b) => {
              const discountA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
              const discountB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
              return discountB - discountA;
            })
            .slice(0, 10); // Take top 10 deals

          setProducts(discountedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch daily deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

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

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-5 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-red-100 border-b border-red-200">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top Left Ribbon */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        {/* Top Right Ribbon */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        {/* Bottom Left Ribbon */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        {/* Bottom Right Ribbon */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        {/* Diagonal Stripe Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(239, 68, 68, 0.1) 10px,
            rgba(239, 68, 68, 0.1) 20px
          )`
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Ribbon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Ribbon Badge */}
            <div className="relative">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                <Percent className="w-4 h-4" />
                <span className="font-bold text-sm">Daily Deals</span>
              </div>
              {/* Ribbon Tail */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-700 transform rotate-45" />
            </div>
            {/* Flashing Badge */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full animate-pulse">
              <span className="w-2 h-2 bg-amber-600 rounded-full animate-ping" />
              <span>LIMITED TIME</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/products?discount=true"
              className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md"
            >
              View All
            </Link>
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur border border-red-200 rounded-full text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur border border-red-200 rounded-full text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
          {products.map((product, index) => {
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
                <div className="bg-white/90 backdrop-blur rounded-xl p-2 border border-red-200/50 hover:shadow-xl hover:border-red-400 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  
                  {/* Top Deal Badge for First Item */}
                  {index === 0 && (
                    <div className="absolute top-0 right-0 z-20 p-2">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        🔥 HOT
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-2 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    {discountPercentage && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {discountPercentage}% OFF
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Name */}
                  <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <div className="flex items-center gap-1.5">
                    <p className="text-base font-bold text-red-600">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(product.originalPrice)}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DailyDeals;
