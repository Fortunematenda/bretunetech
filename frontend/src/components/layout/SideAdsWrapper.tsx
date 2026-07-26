'use client';

import { usePathname } from 'next/navigation';
import { LeftSideAds, RightSideAds } from '@/components/layout/SideAds';

export default function SideAdsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // PDP matches Takealot: full-width centered content, no side-ad columns
  const isProductPage = pathname?.startsWith('/products/') && pathname.split('/').length > 2;

  if (isProductPage) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="flex w-full justify-center">
      <LeftSideAds />
      <div className="min-w-0 w-full max-w-[1560px] flex-1">
        {children}
      </div>
      <RightSideAds />
    </div>
  );
}
