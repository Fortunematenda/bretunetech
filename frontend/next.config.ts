import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next',
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
