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
  { label: 'Account', href: '/account/settings', icon: User },
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
              className="flex-1 flex flex-col items-center justify-center pt-2 pb-1.5 gap-0.5 relative"
            >
              {/* Active pill background on icon */}
              <div className="relative">
                <div className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${active ? 'bg-blue-50 w-10 h-6' : 'w-8 h-6'}`}>
                  <Icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-[#003d7a]' : 'text-gray-400'}`} strokeWidth={active ? 2.5 : 1.75} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-semibold leading-none transition-colors ${active ? 'text-[#003d7a]' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
