import React from 'react';
import * as Sentry from '@sentry/react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});

export default function App(): React.JSX.Element {
  return <AppNavigator />;
}
