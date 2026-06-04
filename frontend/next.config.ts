import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next',
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
