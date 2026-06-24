import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Request a Quote',
  description: 'Request a custom quotation from Bretunetech for networking equipment, IT solutions, and enterprise technology projects.',
  path: '/quote',
});

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
