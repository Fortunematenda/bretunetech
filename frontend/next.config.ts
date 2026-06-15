import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next',
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Strip trailing /api from NEXT_PUBLIC_API_URL to get the base host
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = raw.replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
