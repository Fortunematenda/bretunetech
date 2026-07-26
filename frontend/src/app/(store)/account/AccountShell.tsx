'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getActivePage = () => {
    if (pathname === '/account') return 'profile';
    if (pathname === '/account/orders') return 'orders';
    if (pathname === '/account/wishlist') return 'wishlist';
    if (pathname === '/account/addresses') return 'addresses';
    if (pathname === '/account/payment-methods') return 'payment-methods';
    if (pathname === '/account/profile') return 'profile';
    if (pathname === '/account/settings') return 'settings';
    return 'settings';
  };

  return (
    <>
      <div className="hidden md:flex min-h-screen">
        <AccountSidebar activePage={getActivePage()} />
        <div className="flex-1">{children}</div>
      </div>
      <div className="md:hidden">{children}</div>
    </>
  );
}
