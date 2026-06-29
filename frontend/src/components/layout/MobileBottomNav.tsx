'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useState, useEffect } from 'react';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/products', icon: LayoutGrid },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Account', href: '/account', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());

  useEffect(() => { setMounted(true); }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-stretch">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const isCart = href === '/cart';
          const isWishlist = href === '/wishlist';
          const badge = isCart ? (mounted && itemCount > 0 ? itemCount : 0) : isWishlist ? (mounted && wishlistCount > 0 ? wishlistCount : 0) : 0;

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors ${
                active ? 'text-[#003d7a]' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-[#003d7a]' : 'text-gray-400'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#003d7a] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
