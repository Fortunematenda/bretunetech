import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Curated Tech Bundles & Kits',
  description:
    'Save with hand-picked BretuneTech kits — work-from-home, load shedding backup, and small-business network bundles for South African homes and offices.',
  path: '/bundles',
});

export default function BundlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
