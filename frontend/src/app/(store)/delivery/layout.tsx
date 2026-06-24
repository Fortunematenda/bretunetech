import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Delivery Information',
  description: 'Bretunetech delivers nationwide across South Africa. Learn about our shipping options, delivery times, and fees.',
  path: '/delivery',
});

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
