import * as Sentry from '@sentry/nextjs';

interface SentryHandlerInput {
  event: string;
  api?: {
    bodyParser: boolean;
  };
}

export const onRequestError = (
  err: unknown,
  request: {
    path: string;
    hostname: string;
    req?: { headers: Record<string, string | undefined> };
  }
) => {
  console.error('[Sentry]', request.path, err);
};

export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn || dsn.includes('[key]')) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.05,
  });
}

export const config = {
  api: {
    bodyParser: true,
  },
};
