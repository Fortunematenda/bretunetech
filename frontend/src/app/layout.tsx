import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MaintenanceProvider } from '@/components/MaintenanceProvider';
import { brand } from '@/lib/brand';
import { generateLocalBusinessSchema, generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import MicrosoftClarity from '@/components/analytics/MicrosoftClarity';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// Static metadata — do not await APIs here (it blocks every page refresh).
// Optional GSC/Bing codes via env (also configurable in admin for ops; set these in deploy env for production).
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
const brandTitle = `${brand.name} | Enterprise Technology & Networking`;

export const metadata: Metadata = {
  metadataBase: new URL(brand.website),
  title: {
    default: brandTitle,
    template: `%s | ${brand.name}`,
  },
  description:
    `${brand.name} — ${brand.tagline} Shop networking, power solutions, and computing products for South African businesses.`,
  keywords: [
    'networking equipment',
    'enterprise technology',
    'Ubiquiti',
    'MikroTik',
    'South Africa',
    'IT solutions',
    'fibre',
    'CCTV',
    'Wi-Fi',
  ],
  authors: [{ name: brand.name }],
  creator: brand.name,
  publisher: brand.name,
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
    canonical: brand.website,
  },
  openGraph: {
    siteName: brand.name,
    url: brand.website,
    title: brandTitle,
    description:
      'Premium enterprise networking, power solutions, and computing products for South African businesses.',
    type: 'website',
    locale: 'en_ZA',
    images: [{ url: '/assets/logo/og-image.png', width: 1200, height: 630, alt: brand.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: brandTitle,
    description:
      'Premium enterprise networking, power solutions, and computing products for South African businesses.',
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
  ...(googleVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
        },
      }
    : {}),
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
  const localSchema = generateLocalBusinessSchema();

  return (
    <html
      lang="en"
      className={cn('h-full antialiased font-sans', inter.variable, inter.className)}
      data-scroll-behavior="smooth"
    >
      <body className="h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
        />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
