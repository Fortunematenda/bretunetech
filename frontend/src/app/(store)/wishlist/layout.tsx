import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Wishlist',
  description: 'Your saved products at Bretunetech.',
  path: '/wishlist',
  noIndex: true,
});

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
