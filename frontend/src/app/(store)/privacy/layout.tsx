import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description: 'Bretunetech privacy policy. Learn how we collect, use, and protect your personal information.',
  path: '/privacy',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
