import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shop',
  description: 'Browse networking and IT products at BretuneTech.',
  path: '/shop',
  noIndex: true,
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
