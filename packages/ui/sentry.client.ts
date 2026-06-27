import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://example-sentry-dsn.com',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'],
    }),
  ],
});

export { Sentry };