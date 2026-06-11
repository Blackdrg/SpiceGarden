const path = require('path');

const nextConfig = {
  transpilePackages: ['@spicegarden/ui'],
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
