import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNavigator } from './src/navigation/AppNavigator';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
  debug: false,
});

export default function App(): React.JSX.Element {
  useEffect(() => {
    AsyncStorage.getItem('sg_consent').then((json) => {
      if (json) {
        const c = JSON.parse(json) as { analytics: boolean };
        if (c.analytics) {
          Sentry.init({
            dsn: process.env.SENTRY_DSN,
            tracesSampleRate: 1.0,
            debug: false,
          });
        }
      }
    });
  }, []);

  return <AppNavigator />;
}
