import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('[key]')) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.05,
      profilesSampleRate: 0.01,
    });
  }
}
