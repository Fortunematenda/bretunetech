import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shop',
  description: 'Shop enterprise networking, power solutions, and computing products at Bretunetech. Nationwide delivery across South Africa.',
  path: '/shop',
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
