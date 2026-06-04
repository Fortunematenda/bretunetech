'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import BrandLogos from '@/components/ads/BrandLogos';
import TrustIndicators from '@/components/sections/TrustIndicators';
import Solutions from '@/components/sections/Solutions';
import EnhancedProductCard from '@/components/ui/EnhancedProductCard';
import { ArrowRight, Loader2 } from 'lucide-react';
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
  { name: 'Technology', slug: 'technology', icon: '💻' },
  { name: 'Accessories', slug: 'accessories', icon: '🔌' },
  { name: 'Cameras', slug: 'cameras', icon: '📷' },
];

// Fallback featured products if API fails
const fallbackFeaturedProducts: FeaturedProduct[] = [
  { id: 'p6', slug: 'mikrotik-hap-ac3', name: 'MikroTik hAP ac3 Router', price: 2299, image: '/assets/products-pics/MikroTik-hAP-ac3-Router.jfif', badge: 'Best Seller', stock: 'in', rating: 4.8, shipsToday: true },
  { id: 'p7', slug: 'ubiquiti-unifi-u6-lite', name: 'Ubiquiti UniFi U6 Lite AP', price: 2199, image: '/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP1.jfif', badge: 'New', stock: 'in', rating: 4.9, shipsToday: true },
  { id: 'p3', slug: 'mecer-1200va-ups', name: 'Mecer 1200VA UPS', price: 2699, image: '/assets/products-pics/Mecer-1200VA-UPS-1.jfif', badge: 'Best Seller', stock: 'low', rating: 4.7 },
  { id: 'p5', slug: 'hubble-am2-51v-lithium-battery', name: 'Hubble AM-2 5.1kWh Battery', price: 16999, image: '/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery1.jfif', badge: 'Premium', stock: 'in', rating: 5.0 },
  { id: 'p10', slug: 'must-3kw-hybrid-inverter', name: 'Must 3KW Hybrid Solar Inverter', price: 8499, image: '/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter1.jfif', badge: 'Popular', stock: 'in', rating: 4.6, shipsToday: true },
  { id: 'p11', slug: 'cat6-network-cable', name: 'CAT6 Network Cable 305m', price: 1299, image: '/assets/products-pics/CAT6-Network-Cable-305m.jfif', badge: 'Value', stock: 'in', rating: 4.5 },
];

export default function Home() {
  const productsRef = useScrollAnimation();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start with fallback products immediately so something shows
    setFeaturedProducts(fallbackFeaturedProducts);
    setLoading(false);

    // Try to fetch real featured products in background
    const fetchFeaturedProducts = async () => {
      try {
        console.log('Fetching featured products...');
        const response = await productsApi.list({ featured: 'true', limit: '6' });
        console.log('Featured products response:', response);
        if (response.products && response.products.length > 0) {
          console.log('Found', response.products.length, 'featured products');
          // Transform API products to match EnhancedProductCard interface
          const transformed = response.products.map((product: any) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.sellingPrice,
            image: product.images?.[0]?.url || '/assets/products-pics/placeholder.png',
            badge: product.tags?.[0]?.tag || undefined,
            stock: (product.stockQuantity === 0 ? 'out' : product.stockQuantity <= product.lowStockThreshold ? 'low' : 'in') as 'in' | 'low' | 'out',
            rating: 4.5, // Default rating - could be calculated from reviews
            shipsToday: product.stockQuantity > 0,
          }));
          setFeaturedProducts(transformed);
        } else {
          console.log('No featured products found, keeping fallback');
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        // Already showing fallback, so no change needed
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">

      {/* Main layout: sidebar + content */}
      <div className="flex w-full">

        {/* ── Left Category Sidebar (desktop only) ── */}
        <aside className="hidden lg:block w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen">
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

        {/* ── Main Content Area ── */}
        <div className="flex-1 min-w-0">

          {/* Brand Logos */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Featured Brands</p>
            <BrandLogos />
          </div>

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

          {/* Trust Indicators */}
          <TrustIndicators />

          {/* Featured Products */}
          <section className="py-8 px-4 sm:px-6" ref={productsRef as React.RefObject<HTMLElement>}>
            <div className="text-center mb-6 animate-on-scroll">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Featured Products</h2>
              <p className="text-gray-500 text-sm">Hand-picked networking essentials for your business</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#003d7a] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {featuredProducts.map((product, i) => (
                  <div key={product.id} className={`animate-on-scroll animate-delay-${Math.min(i + 1, 6)}`}>
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
          </section>

          {/* Solutions */}
          <Solutions />

        </div>
      </div>
    </div>
  );
}
