import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../redux/store';
import { trackEvent, ToastProvider } from '@spicegarden/ui';
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://example-sentry-dsn.com',
  tracesSampleRate: 0.0,
  profilesSampleRate: 0.0,
});

const queryClient = new QueryClient();

export default function RestaurantApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    trackEvent({ event: 'page_view', properties: { url: window?.location?.href } });
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Sentry.ErrorBoundary fallback={<p>An error occurred</p>}>
            <Component {...pageProps} />
          </Sentry.ErrorBoundary>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}
