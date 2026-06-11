import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

export const wrapRootElement: Sentry.WrapRootElementFunction = ({ element }) => element;
export const wrapRootComponent = wrapRootElement;
