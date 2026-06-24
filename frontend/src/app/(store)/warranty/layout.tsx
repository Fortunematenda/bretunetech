import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Warranty Policy',
  description: 'Bretunetech warranty information. Learn about manufacturer warranties, warranty claims, and product support.',
  path: '/warranty',
});

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
