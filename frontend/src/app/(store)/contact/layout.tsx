import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Bretunetech for sales enquiries, technical support, or service bookings. Based in Cape Town, serving all of South Africa.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
