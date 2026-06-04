'use client';

import { Sparkles, TrendingUp, Star } from 'lucide-react';

interface SponsoredBadgeProps {
  type?: 'sponsored' | 'featured' | 'bestseller';
  size?: 'sm' | 'md';
  className?: string;
}

const badges = {
  sponsored: {
    icon: Sparkles,
    text: 'Sponsored',
    gradient: 'from-blue-500 to-cyan-400',
  },
  featured: {
    icon: Star,
    text: 'Featured',
    gradient: 'from-purple-500 to-pink-400',
  },
  bestseller: {
    icon: TrendingUp,
    text: 'Best Seller',
    gradient: 'from-orange-500 to-yellow-400',
  },
};

export default function SponsoredBadge({
  type = 'sponsored',
  size = 'sm',
  className = '',
}: SponsoredBadgeProps) {
  const { icon: Icon, text, gradient } = badges[type];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold text-white bg-gradient-to-r ${gradient} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {text}
    </span>
  );
}
