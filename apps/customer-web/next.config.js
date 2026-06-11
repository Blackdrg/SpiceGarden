const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@spicegarden/ui', '@spicegarden/shared'],
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  webpack: (config) => {
    return config;
  },
};
module.exports = nextConfig;
