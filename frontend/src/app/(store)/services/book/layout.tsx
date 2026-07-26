import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Book a Network Service',
  description:
    'Book Wi-Fi, fibre, CCTV, MikroTik, or remote support with BretuneTech. Fast scheduling for Cape Town and nationwide South African businesses.',
  path: '/services/book',
});

export default function BookServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
