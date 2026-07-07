const path = require('path');

const nextConfig = {
  transpilePackages: ['@spicegarden/ui'],
  experimental: {
    externalDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: path.resolve(__dirname, '../../')
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;