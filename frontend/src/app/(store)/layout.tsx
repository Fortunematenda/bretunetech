import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { LeftSideAds, RightSideAds } from '@/components/layout/SideAds';
import WhatsAppChat from '@/components/ui/WhatsAppChat';
import { PageTracker } from '@/components/analytics/PageTracker';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-full flex flex-col text-gray-900 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #e8edf5 0%, #f1f5f9 40%, #e2e8f0 100%)' }}
    >
      <div className="hidden md:block"><AnnouncementBar /></div>
      <Navbar />
      <main className="flex-1 relative z-10 w-full overflow-x-hidden pb-16 md:pb-0" style={{ background: 'transparent' }}>
        <div className="flex w-full">
          <LeftSideAds />
          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>
          <RightSideAds />
        </div>
      </main>
      <div className="hidden md:block"><Footer /></div>
      <MobileBottomNav />
      <WhatsAppChat />
      <PageTracker />
    </div>
  );
}
