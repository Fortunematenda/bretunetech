import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bretunetech | Enterprise Technology & Networking',
  description: 'Bretunetech — Enterprise Technology. Reliable Connectivity. Shop networking, power solutions, and computing products.',
  metadataBase: new URL('https://www.bretunetech.com'),
  openGraph: {
    siteName: 'Bretunetech',
    url: 'https://www.bretunetech.com',
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
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
