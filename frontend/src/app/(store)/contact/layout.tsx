import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Contact Us',
  description:
    'Contact BretuneTech in Cape Town for networking products, Wi-Fi, fibre, CCTV, and MikroTik quotes. Call, WhatsApp, or email sales@bretunetech.com.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
