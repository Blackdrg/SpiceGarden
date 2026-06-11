import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@spicegarden/ui', '@spicegarden/shared'],
  experimental: { externalDir: true },
  turbopack: {},
  webpack: (config) => config,
};

export default nextConfig;
