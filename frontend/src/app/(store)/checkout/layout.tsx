import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Checkout',
  description: 'Complete your purchase at Bretunetech.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
