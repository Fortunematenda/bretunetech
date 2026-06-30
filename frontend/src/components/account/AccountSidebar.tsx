'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid2X2, Package, Heart, MapPin, CreditCard, Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';

function SidebarLink({
  icon: Icon,
  label,
  href,
  active,
  badge,
}: {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
        active
          ? 'bg-[#e6f0ff] text-[#003d7a]'
          : 'text-slate-700 hover:bg-slate-50 hover:text-[#003d7a]'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1">{label}</span>

      {badge ? (
        <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

interface AccountSidebarProps {
  activePage?: 'dashboard' | 'orders' | 'profile' | 'addresses' | 'payment-methods' | 'settings' | 'wishlist';
}

export default function AccountSidebar({ activePage = 'settings' }: AccountSidebarProps) {
  const { user, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.itemCount());
  const router = useRouter();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] sticky top-20 shrink-0">
      <div className="p-6">
        <Link href="/account/profile" className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-[#003d7a] text-white flex items-center justify-center font-bold text-lg">
            {getInitials()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{getFullName()}</h3>
            <p className="text-sm text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </Link>

        <nav className="space-y-2">
          <SidebarLink icon={User} label="My Profile" href="/account/profile" active={activePage === 'profile'} />
          <SidebarLink icon={Package} label="My Orders" href="/account/orders" active={activePage === 'orders'} />
          <SidebarLink icon={Heart} label="My Wishlist" href="/account/wishlist" active={activePage === 'wishlist'} badge={wishlistCount} />
          <SidebarLink icon={MapPin} label="Addresses" href="/account/addresses" active={activePage === 'addresses'} />
          <SidebarLink icon={CreditCard} label="Payment Methods" href="/account/payment-methods" active={activePage === 'payment-methods'} />
        </nav>

        <div className="border-t border-slate-200 mt-8 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
