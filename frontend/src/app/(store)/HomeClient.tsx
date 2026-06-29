'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogos from '@/components/ads/BrandLogos';
import PremiumHero from '@/components/sections/PremiumHero';
import DailyDeals from '@/components/sections/DailyDeals';
import FeaturedCategories from '@/components/sections/FeaturedCategories';
import BusinessSolutions from '@/components/sections/BusinessSolutions';
import Testimonials from '@/components/sections/Testimonials';
import RecentlyViewed from '@/components/sections/RecentlyViewed';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import StayConnected from '@/components/sections/StayConnected';
import EnhancedProductCard from '@/components/ui/EnhancedProductCard';
import MobileHomePage from '@/components/sections/MobileHomePage';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const shopByFilters = [
  { name: 'In Stock', slug: 'in-stock', icon: '✓' },
  { name: 'On Special', slug: 'on-special', icon: '🏷️' },
  { name: 'New Arrivals', slug: 'new-arrivals', icon: '✨' },
  { name: 'Under R500', slug: 'under-500', icon: '💰' },
  { name: 'Best Sellers', slug: 'best-sellers', icon: '⭐' },
];

const categoryIcons: Record<string, string> = {
  'networking': '🌐', 'wifi-routers': '📶', 'mesh-systems': '🔗',
  'cctv-cameras': '📷', 'poe-switches': '🔌', 'cables-accessories': '🔗',
  'software-services': '💻', 'routers': '📶', 'switches': '🔌',
  'cameras': '📷', 'accessories': '🔗', 'cables': '🔗',
  'network': '🌐', 'wifi': '📶', 'mesh': '🔗', 'cctv': '📷',
  'poe': '🔌', 'software': '💻', 'services': '💻', 'default': '📦',
};

function getCategoryIcon(slug: string, name: string): string {
  const lowerSlug = slug.toLowerCase();
  const lowerName = name.toLowerCase();
  if (categoryIcons[lowerSlug]) return categoryIcons[lowerSlug];
  if (lowerName.includes('network')) return '🌐';
  if (lowerName.includes('wifi') || lowerName.includes('router')) return '📶';
  if (lowerName.includes('mesh')) return '🔗';
  if (lowerName.includes('cctv') || lowerName.includes('camera')) return '📷';
  if (lowerName.includes('poe') || lowerName.includes('switch')) return '🔌';
  if (lowerName.includes('cable') || lowerName.includes('accessor')) return '🔗';
  if (lowerName.includes('software') || lowerName.includes('service')) return '💻';
  if (lowerName.includes('technology') || lowerName.includes('tech')) return '💻';
  if (lowerName.includes('power')) return '⚡';
  if (lowerName.includes('general')) return '📦';
  return categoryIcons.default;
}

interface Category { id: string; name: string; slug: string; imageUrl?: string; }
interface Brand { id: string; name: string; slug: string; }
interface FeaturedProduct {
  id: string; slug: string; name: string; price: number;
  originalPrice?: number; image: string; badge?: string;
  stock: 'in' | 'low' | 'out'; rating?: number; shipsToday?: boolean; shippingDays?: number;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  featuredProducts: FeaturedProduct[];
}

export default function HomeClient({ categories, brands, featuredProducts }: Props) {
  const productsRef = useScrollAnimation();

  return (
    <div className="min-h-screen">
      {/* ── Mobile Layout ── */}
      <div className="md:hidden">
        <MobileHomePage categories={categories} brands={brands} featuredProducts={featuredProducts} />
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
      <div className="flex w-full">
        {/* ── Left Category Sidebar (desktop only) ── */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-200">
          <div className="py-4 px-3 space-y-6">
            <div>
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2">Categories</p>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#003d7a] transition-colors rounded">
                    <span className="text-base">{getCategoryIcon(cat.slug, cat.name)}</span>
                    {cat.name}
                  </Link>
                ))}
                <Link href="/products" className="flex items-center gap-2 px-3 py-2 mt-1 text-sm text-[#003d7a] font-semibold hover:bg-blue-50 transition-colors rounded">
                  <ArrowRight className="w-3.5 h-3.5" /> All Products
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2">Shop By</p>
              <div className="space-y-0.5">
                {shopByFilters.map((filter) => (
                  <Link key={filter.slug} href={`/products?filter=${filter.slug}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#003d7a] transition-colors rounded">
                    <span className="text-base">{filter.icon}</span>
                    {filter.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2">Brands</p>
              <div className="space-y-0.5">
                {brands.map((brand) => (
                  <Link key={brand.slug} href={`/products?brand=${brand.slug}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#003d7a] transition-colors rounded">
                    <span className="w-2 h-2 rounded-full bg-[#003d7a]" />
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm font-semibold text-gray-900 mb-1">Need help choosing?</p>
              <p className="text-xs text-gray-600 mb-3">Chat with us on WhatsApp</p>
              <a href="https://wa.me/27612685933" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#003d7a] hover:bg-blue-800 text-white text-xs font-semibold rounded transition-colors">
                <span>💬</span> 061 268 5933
              </a>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-3">Why Choose Us</p>
              <ul className="space-y-2">
                {['Local South African support', 'Networking & CCTV experts', 'Secure payments', 'Fast delivery'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="text-[#003d7a] mt-0.5">✓</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Featured Brands</p>
            <BrandLogos />
          </div>

          <PremiumHero />
          <RecentlyViewed />

          <section className="pt-8 pb-6 px-4 sm:px-6 lg:px-8" ref={productsRef as React.RefObject<HTMLElement>}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
              </div>
              {featuredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No featured products available</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="h-full">
                      <EnhancedProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 text-center">
                <Link href="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#003d7a] hover:bg-blue-800 text-white text-sm font-semibold rounded transition-all">
                  View All Products <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full hover:bg-blue-50 hover:text-[#003d7a] hover:border-blue-200 transition-colors whitespace-nowrap">
                  <span>{getCategoryIcon(cat.slug, cat.name)}</span>
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

      <div className="w-full">
        <DailyDeals />
        <WhyChooseUs />
        <BusinessSolutions />
        <Testimonials />
        <StayConnected />
      </div>
      </div>{/* end desktop */}
    </div>
  );
}
