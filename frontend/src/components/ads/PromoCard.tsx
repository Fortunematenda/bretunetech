'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Tag, Gift, Star } from 'lucide-react';

interface PromoCardProps {
  variant?: 'deal' | 'limited' | 'bundle' | 'review';
  title?: string;
  description?: string;
  highlight?: string;
  href?: string;
  expiresAt?: string;
  className?: string;
}

const variants = {
  deal: {
    icon: Tag,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    badge: 'Best Deal',
    badgeBg: 'bg-blue-500',
  },
  limited: {
    icon: Clock,
    gradient: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/30',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    badge: 'Limited Time',
    badgeBg: 'bg-orange-500',
  },
  bundle: {
    icon: Gift,
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    badge: 'Bundle Offer',
    badgeBg: 'bg-purple-500',
  },
  review: {
    icon: Star,
    gradient: 'from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/30',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    badge: 'Top Rated',
    badgeBg: 'bg-yellow-500',
  },
};

export default function PromoCard({
  variant = 'deal',
  title,
  description,
  highlight,
  href = '/products',
  expiresAt,
  className = '',
}: PromoCardProps) {
  const { icon: Icon, gradient, border, iconBg, iconColor, badge, badgeBg } = variants[variant];

  const defaultContent = {
    deal: {
      title: 'Flash Sale: Laptops',
      description: 'Save up to 25% on refurbished business laptops this week only.',
      highlight: 'From R4,999',
    },
    limited: {
      title: 'Weekend Special',
      description: 'Get a free UPS battery with any inverter purchase.',
      highlight: 'Ends Sunday',
    },
    bundle: {
      title: 'Complete Home Office',
      description: 'Laptop + Monitor + UPS + Peripherals in one package.',
      highlight: 'Save R2,500',
    },
    review: {
      title: 'Customer Favorite',
      description: 'The Mecer 1200VA UPS is our best-selling power solution.',
      highlight: '4.9 ★ (127 reviews)',
    },
  };

  const content = defaultContent[variant];

  return (
    <div className={`group relative overflow-hidden rounded-xl border ${border} bg-gradient-to-br ${gradient} backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg ${className}`}>
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
      
      {/* Badge */}
      <div className={`absolute top-3 right-3 px-2 py-0.5 ${badgeBg} text-white text-[10px] font-bold rounded-full`}>
        {badge}
      </div>

      <div className="relative">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mb-3`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {title || content.title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {description || content.description}
        </p>

        {highlight && (
          <div className="text-sm font-semibold text-white mb-3">
            {highlight || content.highlight}
          </div>
        )}

        {expiresAt && (
          <div className="flex items-center gap-1 text-xs text-orange-400 mb-3">
            <Clock className="w-3 h-3" />
            <span>Expires: {expiresAt}</span>
          </div>
        )}

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-gray-200 transition-colors group/link"
        >
          View Details 
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
