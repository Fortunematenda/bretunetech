import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Brands',
  description: 'Shop products from leading networking and technology brands including Ubiquiti, MikroTik, Dahua, and more at Bretunetech.',
  path: '/brands',
});

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
