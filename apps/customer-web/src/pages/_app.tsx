import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../redux/store';
import { NetworkStatusProvider } from '../contexts/NetworkStatusContext';
import { ToastProvider } from '@spicegarden/ui';
import OfflineIndicator from '../components/OfflineIndicator';
import ErrorBoundary from '../components/ErrorBoundary';
import { initSentry } from '../../sentry.client.config';
import CookieConsentBanner from '../components/CookieConsentBanner';
import Footer from '../components/Footer';
import '../analytics';
import { useAnalytics } from '../analytics';
import { useMotion } from '../hooks/useMotion';
import { useEffect, useState } from 'react';
import styles from './_app.module.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const prefersReducedMotion = useMotion();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useAnalytics();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NetworkStatusProvider>
          <ToastProvider>
            <ErrorBoundary>
              <div className={`${styles.entryAnimation} ${animated ? styles.animated : ''} ${prefersReducedMotion ? styles.reducedMotion : ''}`}>
                <Component {...pageProps} />
                <OfflineIndicator />
                <CookieConsentBanner />
                <Footer />
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </NetworkStatusProvider>
      </QueryClientProvider>
    </Provider>
  );
}
