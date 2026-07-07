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
import ShopBySolution from '@/components/sections/ShopBySolution';
import CategoryProductSection from '@/components/sections/CategoryProductSection';
import InstallationServicesCTA from '@/components/sections/InstallationServicesCTA';
import { ArrowRight, Wifi, Camera, Zap } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const categoryIcons: Record<string, string> = {
  'computers-laptops': '💻', 'laptops': '💻', 'desktop-pcs': '🖥️', 'mini-pcs': '🖥️', 'all-in-one-pcs': '🖥️',
  'computer-components': '🔧', 'motherboards': '🔧', 'processors-cpus': '⚡', 'graphics-cards-gpus': '🎮', 'ram': '💾', 'power-supplies-psus': '🔌', 'pc-cases': '📦', 'cooling': '❄️', 'fans': '💨', 'thermal-paste': '🧴',
  'storage-memory': '💾', 'ssds': '💾', 'hard-drives': '💿', 'external-storage': '📀', 'usb-flash-drives': '🔌', 'memory-cards': '💳', 'nas-storage': '🖥️',
  'networking': '🌐', 'routers': '📶', 'mesh-wifi-systems': '📶', 'access-points': '📡', 'network-switches': '🔌', 'network-cables': '🔗', 'fibre-equipment': '🌐', 'network-cabinets': '🗄️', 'poe-equipment': '⚡',
  'cctv-security': '📷', 'cctv-cameras': '📷', 'nvrs-dvrs': '📼', 'video-doorbells': '🔔', 'access-control': '🔑', 'alarm-systems': '🚨', 'intercom-systems': '📞',
  'power-backup': '⚡', 'ups-systems': '🔋', 'inverters': '⚡', 'batteries': '🔋', 'surge-protectors': '🔌', 'solar-accessories': '☀️', 'power-distribution-units': '🔌',
  'wireless-solutions': '📡', 'outdoor-wireless': '📡', 'point-to-point-links': '📡', 'wifi-extenders': '📶', 'wireless-bridges': '🌉', 'antennas': '📡',
  'printers-office': '🖨️', 'printers': '🖨️', 'scanners': '📷', 'ink': '🖊️', 'toners': '🖊️', 'label-printers': '🏷️', 'office-equipment': '📎',
  'peripherals': '⌨️', 'monitors': '🖥️', 'keyboards': '⌨️', 'mice': '🖱️', 'webcams': '📷', 'speakers': '🔊', 'headsets': '🎧', 'docking-stations': '🔌',
  'gaming': '🎮', 'gaming-keyboards': '⌨️', 'gaming-mice': '🖱️', 'gaming-monitors': '🖥️', 'gaming-chairs': '🪑', 'gaming-accessories': '🎮',
  'mobile-smart-devices': '📱', 'smartphones': '📱', 'tablets': '📱', 'smart-watches': '⌚', 'smart-home': '🏠', 'charging-accessories': '🔌',
  'accessories': '🔌', 'hdmi-cables': '🔗', 'displayport-cables': '🔗', 'usb-cables': '🔌', 'adapters': '🔌', 'chargers': '🔋', 'mounts': '📎', 'toolkits': '🧰',
};

function getCategoryIcon(slug: string, name: string): string {
  const lowerSlug = slug.toLowerCase();
  if (categoryIcons[lowerSlug]) return categoryIcons[lowerSlug];
  const lowerName = name.toLowerCase();
  if (lowerName.includes('network')) return '🌐';
  if (lowerName.includes('wifi') || lowerName.includes('router')) return '📶';
  if (lowerName.includes('mesh')) return '🔗';
  if (lowerName.includes('cctv') || lowerName.includes('camera')) return '📷';
  if (lowerName.includes('poe') || lowerName.includes('switch')) return '🔌';
  if (lowerName.includes('cable') || lowerName.includes('accessor')) return '🔗';
  if (lowerName.includes('software') || lowerName.includes('service')) return '💻';
  if (lowerName.includes('power')) return '⚡';
  return '📦';
}

interface Category { id: string; name: string; slug: string; imageUrl?: string; children?: Category[]; }
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

        {/* ── Main Content (full width, no sidebar) ── */}
        <div className="w-full">
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

          <ShopBySolution />
          <DailyDeals />
          <CategoryProductSection
            title="Networking Best Sellers"
            categorySlug="networking"
            accentColor="bg-cyan-500"
            bgColor="bg-white"
            icon={<Wifi className="w-5 h-5 text-white" />}
          />
          <CategoryProductSection
            title="CCTV & Security"
            categorySlug="cctv-security"
            accentColor="bg-purple-600"
            bgColor="bg-gray-50"
            icon={<Camera className="w-5 h-5 text-white" />}
          />
          <CategoryProductSection
            title="Power & Backup"
            categorySlug="power-backup"
            accentColor="bg-yellow-500"
            bgColor="bg-white"
            icon={<Zap className="w-5 h-5 text-white" />}
          />
          <InstallationServicesCTA />
          <WhyChooseUs />
          <BusinessSolutions />
          <Testimonials />
          <StayConnected />
        </div>
      </div>{/* end desktop */}
    </div>
  );
}
