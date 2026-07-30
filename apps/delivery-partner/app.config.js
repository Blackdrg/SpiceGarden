export default ({ config }) => ({
  ...config,
  name: 'SpiceGarden Driver',
  slug: 'spicegarden-driver',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#121212',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.spicegarden.driver',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'SpiceGarden needs your location to receive nearby delivery orders and for live tracking.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'SpiceGarden needs your location to receive nearby delivery orders and for live tracking.',
      NSLocationAlwaysUsageDescription: 'SpiceGarden needs your location to receive nearby delivery orders and for live tracking.',
      UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
      NSUserNotificationUsageDescription: 'SpiceGarden sends notifications for new delivery orders and status updates.',
    },
    entitlements: {
      'aps-environment': 'development',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#121212',
    },
    package: 'com.spicegarden.driver',
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
      projectId: 'spicegarden-driver',
    },
  },
  plugins: [
    'expo-notifications',
    'expo-location',
    'expo-secure-store',
  ],
});