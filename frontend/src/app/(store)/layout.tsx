import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { LeftSideAds, RightSideAds } from '@/components/layout/SideAds';
import WhatsAppChat from '@/components/ui/WhatsAppChat';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description: 'Premium enterprise networking ecommerce and management platform for South African businesses.',
  icons: {
    icon: '/assets/logo/logo.png',
  },
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: 'Premium enterprise networking ecommerce and management platform for South African businesses.',
    type: 'website',
    locale: 'en_ZA',
    siteName: brand.name,
    url: 'https://www.bretunetech.com',
  },
  other: {
    'social:linkedin': 'https://www.linkedin.com/company/bretunetech',
    'social:facebook': 'https://www.facebook.com/bretunetech',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-full flex flex-col text-gray-900 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #e8edf5 0%, #f1f5f9 40%, #e2e8f0 100%)' }}
    >
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 relative z-10 w-full overflow-x-hidden" style={{ background: 'transparent' }}>
        <div className="flex w-full">
          <LeftSideAds />
          <div className="flex-1 min-w-0 max-w-[90vw] mx-auto w-full">
            {children}
          </div>
          <RightSideAds />
        </div>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
