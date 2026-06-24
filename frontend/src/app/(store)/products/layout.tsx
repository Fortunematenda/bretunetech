import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Products',
  description: 'Browse enterprise networking equipment, power solutions, computing products, and IT infrastructure from trusted brands. Free delivery on qualifying orders.',
  path: '/products',
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
