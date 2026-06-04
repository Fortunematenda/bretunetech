'use client';

import Link from 'next/link';
import { X, Sparkles, Percent, Zap, Truck } from 'lucide-react';
import { useState } from 'react';

interface AdBannerProps {
  variant?: 'promo' | 'sale' | 'shipping' | 'new';
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  dismissible?: boolean;
  className?: string;
}

const variants = {
  promo: {
    icon: Sparkles,
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    shadow: 'shadow-blue-500/20',
  },
  sale: {
    icon: Percent,
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    shadow: 'shadow-orange-500/20',
  },
  shipping: {
    icon: Truck,
    gradient: 'from-green-500 via-emerald-500 to-teal-400',
    shadow: 'shadow-green-500/20',
  },
  new: {
    icon: Zap,
    gradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    shadow: 'shadow-purple-500/20',
  },
};

export default function AdBanner({
  variant = 'promo',
  title,
  subtitle,
  cta = 'Shop Now',
  href = '/products',
  dismissible = true,
  className = '',
}: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { icon: Icon, gradient, shadow } = variants[variant];

  if (dismissed) return null;

  const defaultTitles = {
    promo: 'Summer Tech Sale',
    sale: 'Up to 30% Off',
    shipping: 'Free Delivery',
    new: 'New Arrivals',
  };

  const defaultSubtitles = {
    promo: 'Upgrade your setup with premium tech at unbeatable prices',
    sale: 'Limited time offer on selected laptops and power solutions',
    shipping: 'Free shipping on all orders over R1,000 nationwide',
    new: 'Check out the latest load shedding solutions and networking gear',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${shadow} ${className}`}>
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-95`} />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {title || defaultTitles[variant]}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 truncate hidden sm:block">
                {subtitle || defaultSubtitles[variant]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={href}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-900 text-xs sm:text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              {cta}
            </Link>
            
            {dismissible && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
