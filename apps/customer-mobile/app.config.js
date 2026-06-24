export default ({ config }) => ({
  ...config,
  name: 'SpiceGarden Customer',
  slug: 'spicegarden-customer',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F9FAFB',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.spicegarden.customer',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F9FAFB',
    },
    package: 'com.spicegarden.customer',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || (() => {
      if (process.env.NODE_ENV === 'production') return 'https://api.spicegarden.com';
      if (process.env.NODE_ENV === 'staging') return 'https://staging-api.spicegarden.com';
      return 'http://localhost:3001';
    })(),
    socketUrl: process.env.SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL || (() => {
      if (process.env.NODE_ENV === 'production') return 'https://api.spicegarden.com';
      if (process.env.NODE_ENV === 'staging') return 'https://staging-api.spicegarden.com';
      return 'http://localhost:3001';
    })(),
    environment: process.env.NODE_ENV || 'development',
    eas: {
      projectId: 'spicegarden-customer',
    },
  },
  plugins: [],
});
