import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shopping Cart',
  description: 'Your shopping cart at Bretunetech.',
  path: '/cart',
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
