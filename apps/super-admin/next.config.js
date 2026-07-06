const path = require('path');

const nextConfig = {
  transpilePackages: ['@spicegarden/ui'],
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.resolve(__dirname, '../../')
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;