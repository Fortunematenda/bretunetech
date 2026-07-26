import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Get a Quote',
  description:
    "Tell us what you need. We'll scope it, price it, and get back to you within one business day. Wi-Fi, fibre, CCTV, and MikroTik quotes for Cape Town and South Africa.",
  path: '/quote',
});

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
