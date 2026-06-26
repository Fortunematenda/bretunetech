import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MaintenanceProvider } from '@/components/MaintenanceProvider';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';
import VerificationMeta from '@/components/seo/VerificationMeta';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bretunetech.com'),
  title: {
    default: 'Bretunetech | Enterprise Technology & Networking',
    template: '%s | Bretunetech',
  },
  description: 'Bretunetech — Enterprise Technology. Reliable Connectivity. Shop networking, power solutions, and computing products for South African businesses.',
  keywords: ['networking equipment', 'enterprise technology', 'Ubiquiti', 'MikroTik', 'South Africa', 'IT solutions', 'fibre', 'CCTV', 'Wi-Fi'],
  authors: [{ name: 'Bretunetech' }],
  creator: 'Bretunetech',
  publisher: 'Bretunetech',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.png',
  },
  alternates: {
    canonical: 'https://www.bretunetech.com',
  },
  openGraph: {
    siteName: 'Bretunetech',
    url: 'https://www.bretunetech.com',
    title: 'Bretunetech | Enterprise Technology & Networking',
    description: 'Premium enterprise networking, power solutions, and computing products for South African businesses.',
    type: 'website',
    locale: 'en_ZA',
    images: [{ url: '/assets/logo/og-image.png', width: 1200, height: 630, alt: 'Bretunetech' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bretunetech | Enterprise Technology & Networking',
    description: 'Premium enterprise networking, power solutions, and computing products for South African businesses.',
    images: ['/assets/logo/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'social:linkedin': 'https://www.linkedin.com/company/bretunetech',
    'social:facebook': 'https://www.facebook.com/bretunetech',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#003d7a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();
  const webSchema = generateWebsiteSchema();

  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        <VerificationMeta />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
        />
      </head>
      <body className="h-full">
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
      </body>
    </html>
  );
}
