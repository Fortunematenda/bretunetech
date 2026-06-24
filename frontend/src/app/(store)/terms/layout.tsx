import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms & Conditions',
  description: 'Bretunetech terms and conditions of use. Read our terms of service for shopping and using our platform.',
  path: '/terms',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
