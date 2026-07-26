import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: '.next',
  // Monorepo has a root package-lock.json; pin Turbopack to this app so
  // chunk paths stay under frontend/ and avoid ChunkLoadError after HMR.
  turbopack: {
    root: path.join(__dirname),
  },
  // Windows: Turbopack FS cache write/compaction can block requests for 10–60s+.
  // Disable until cache retention is more stable (see next.js#87796 / #94915).
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'bretunetech.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bretunetech.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'www.pinnacle.co.za',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    // Custom Cache-Control on /_next/static breaks Next.js HMR in development.
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        // Hashed build assets — safe to cache forever in production.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/favicon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Strip trailing /api from NEXT_PUBLIC_API_URL to get the base host
    const raw = process.env.NEXT_PUBLIC_API_URL || 'https://api.bretunetech.com/api';
    const baseUrl = raw.replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.bretunetech.com',
          },
        ],
        destination: 'https://bretunetech.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
