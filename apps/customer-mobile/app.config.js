export default ({ config }) => ({
  ...config,
  name: 'SpiceGarden Customer',
  slug: 'spicegarden-customer',
  version: '1.0.0',
  runtimeVersion: {
    android: '1.0.0',
    ios: '1.0.0',
  },
  platforms: ['ios', 'android', 'web'],
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
    url: 'https://u.expo.dev/spicegarden-customer',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.spicegarden.customer',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'SpiceGarden needs your location to show nearby restaurants and track your orders.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'SpiceGarden needs your location to show nearby restaurants and track your orders.',
      NSLocationAlwaysUsageDescription: 'SpiceGarden needs your location to show nearby restaurants and track your orders.',
      UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
      NSUserNotificationUsageDescription: 'SpiceGarden sends notifications for order updates and delivery tracking.',
      NSCameraUsageDescription: 'SpiceGarden needs camera access to scan QR codes for payments.',
      NSPhotoLibraryUsageDescription: 'SpiceGarden needs photo library access to upload payment receipts.',
      NSAppleMusicUsageDescription: 'SpiceGarden may access music for playback during orders.',
      NSBluetoothPeripheralUsageDescription: 'SpiceGarden may use Bluetooth for driver connectivity.',
    },
    entitlements: {
      'aps-environment': 'production',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F9FAFB',
    },
    package: 'com.spicegarden.customer',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    path: './web',
    output: 'single',
  },
  extra: {
    eas: {
      projectId: 'spicegarden-customer',
    },
    apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || (() => {
      if (process.env.NODE_ENV === 'production') return 'https://api.spicegarden.com';
      if (process.env.NODE_ENV === 'staging') return 'https://staging-api.spicegarden.com';
      return 'http://localhost:3001';
    })(),
    socketUrl: process.env.SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL || (() => {
      if (process.env.NODE_ENV === 'production') return 'wss://api.spicegarden.com';
      if (process.env.NODE_ENV === 'staging') return 'wss://staging-api.spicegarden.com';
      return 'http://localhost:3001';
    })(),
    environment: process.env.NODE_ENV || 'development',
  },
  plugins: [
    'expo-notifications',
    'expo-location',
    'expo-secure-store',
    [
      'expo-linking',
      {
        schemes: ['spicegarden', 'spicegarden-cash'],
        android: {
          intentFilters: [
            {
              action: 'VIEW',
              data: [
                { scheme: 'spicegarden', host: 'pay' },
                { scheme: 'spicegarden-cash', host: 'cod' },
              ],
              categories: ['BROWSABLE', 'DEFAULT'],
            },
          ],
        },
        ios: {
          universalLinks: ['https://spicegarden.com/link'],
        },
      },
    ],
  ],
});
