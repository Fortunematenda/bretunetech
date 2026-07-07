'use client';

import { usePathname } from 'next/navigation';
import { LeftSideAds, RightSideAds } from '@/components/layout/SideAds';

export default function SideAdsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/products/') && pathname.split('/').length > 2;

  return (
    <div className="flex w-full">
      {!isProductPage && <LeftSideAds />}
      <div className="flex-1 min-w-0 w-full">
        {children}
      </div>
      <RightSideAds />
    </div>
  );
}
