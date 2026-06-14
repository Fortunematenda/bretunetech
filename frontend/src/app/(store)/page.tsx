'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import BrandLogos from '@/components/ads/BrandLogos';
import PremiumHero from '@/components/sections/PremiumHero';
import DailyDeals from '@/components/sections/DailyDeals';
import FeaturedCategories from '@/components/sections/FeaturedCategories';
import BusinessSolutions from '@/components/sections/BusinessSolutions';
import Testimonials from '@/components/sections/Testimonials';
import RecentlyViewed from '@/components/sections/RecentlyViewed';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import EnhancedProductCard from '@/components/ui/EnhancedProductCard';
import { ArrowRight, Loader2, Tag, Truck, Shield, Headphones } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { productsApi } from '@/lib/api';

interface FeaturedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  stock: 'in' | 'low' | 'out';
  rating?: number;
  shipsToday?: boolean;
}

const sidebarCategories = [
  { name: 'Networking', slug: 'internet-networking', icon: '🌐' },
  { name: 'Power Solutions', slug: 'power-solutions', icon: '⚡' },
  { name: 'Accessories', slug: 'accessories', icon: '🔌' },
  { name: 'Cameras', slug: 'cameras', icon: '📷' },
];


export default function Home() {
  const productsRef = useScrollAnimation();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsApi.list({ featured: 'true', limit: '10' });
        if (response.products && response.products.length > 0) {
          // Transform API products to match EnhancedProductCard interface
          const transformed = response.products.map((product: any) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.sellingPrice,
            originalPrice: product.originalPrice,
            image: product.images?.[0]?.url || '/assets/placeholder.svg',
            badge: product.tags?.map((t: any) => t.tag).join(', ') || undefined,
            stock: (product.stockQuantity === 0 ? 'out' : product.stockQuantity <= product.lowStockThreshold ? 'low' : 'in') as 'in' | 'low' | 'out',
            rating: product.averageRating || 0,
            shipsToday: product.stockQuantity > 0,
            shippingDays: product.shippingDays || 3,
          }));
          setFeaturedProducts(transformed);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">

      {/* Main layout: sidebar + content (ends after RecentlyViewed) */}
      <div className="flex w-full">

        {/* ── Left Category Sidebar (desktop only) ── */}
        <aside className="hidden lg:block w-56 shrink-0 bg-white border-r border-gray-200">
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">Categories</p>
            {sidebarCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#003d7a] transition-colors border-b border-gray-50"
              >
                <span className="text-base">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
            <Link href="/products" className="flex items-center gap-2 px-4 py-3 mt-1 text-sm text-[#003d7a] font-semibold hover:bg-blue-50 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" /> All Products
            </Link>
          </div>
        </aside>

        {/* ── Main Content Area (ends after RecentlyViewed) ── */}
        <div className="flex-1 min-w-0">

          {/* Brand Logos */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Featured Brands</p>
            <BrandLogos />
          </div>

          {/* Hero Banner */}
          <PremiumHero />

          {/* Recently Viewed */}
          <RecentlyViewed />

          {/* Mobile Category Chips (visible on mobile only, where sidebar is hidden) */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              {sidebarCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full hover:bg-blue-50 hover:text-[#003d7a] hover:border-blue-200 transition-colors whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
              <Link href="/products" className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#003d7a] bg-blue-50 border border-blue-200 rounded-full whitespace-nowrap">
                All Products →
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Full Width Content (below sidebar) ── */}
      <div className="w-full">

        {/* Featured Products */}
        <section className="py-8 px-4 sm:px-6 lg:px-8" ref={productsRef as React.RefObject<HTMLElement>}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 animate-on-scroll">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Featured Products</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#003d7a] animate-spin" />
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No featured products available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {featuredProducts.map((product, i) => (
                  <div key={product.id} className="h-full">
                    <EnhancedProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#003d7a] hover:bg-blue-800 text-white text-sm font-semibold rounded transition-all">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Daily Deals */}
        <DailyDeals />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Business Solutions */}
        <BusinessSolutions />

        {/* Testimonials */}
        <Testimonials />

      </div>
    </div>
  );
}
