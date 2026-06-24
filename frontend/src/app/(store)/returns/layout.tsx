import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Returns & Refunds',
  description: 'Bretunetech returns and refunds policy. Learn how to return products and request refunds for your orders.',
  path: '/returns',
});

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
