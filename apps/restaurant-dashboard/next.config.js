const path = require('path');

const nextConfig = {
  transpilePackages: ['@spicegarden/ui'],
  experimental: {
    externalDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {},
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
