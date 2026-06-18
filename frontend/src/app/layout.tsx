import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MaintenanceProvider } from '@/components/MaintenanceProvider';
import SchemaOrgData from '@/components/ui/SchemaOrgData';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bretunetech | Enterprise Technology & Networking',
  description: 'Bretunetech — Enterprise Technology. Reliable Connectivity. Shop networking, power solutions, and computing products.',
  metadataBase: new URL('https://www.bretunetech.com'),
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    siteName: 'Bretunetech',
    url: 'https://www.bretunetech.com',
    title: 'Bretunetech | Enterprise Technology & Networking',
    description: 'Premium enterprise networking ecommerce and management platform for South African businesses.',
    type: 'website',
    locale: 'en_ZA',
  },
  other: {
    'social:linkedin': 'https://www.linkedin.com/company/bretunetech',
    'social:facebook': 'https://www.facebook.com/bretunetech',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#003d7a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        <SchemaOrgData />
      </head>
      <body className="h-full">
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
      </body>
    </html>
  );
}
