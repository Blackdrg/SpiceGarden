import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../redux/store';
import { NetworkStatusProvider } from '../contexts/NetworkStatusContext';
import OfflineIndicator from '../components/OfflineIndicator';
import ErrorBoundary from '../components/ErrorBoundary';
import '../analytics';
import { useAnalytics } from '../analytics';
import { useEnterAnimation } from '../hooks/useAnimation';
import { useMotion } from '../hooks/useMotion';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const prefersReducedMotion = useMotion();
  const entryAnimation = useEnterAnimation(true, 'fade', prefersReducedMotion ? 0 : 250);

  useAnalytics();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NetworkStatusProvider>
          <ErrorBoundary>
            <div style={entryAnimation}>
              <Component {...pageProps} />
              <OfflineIndicator />
            </div>
          </ErrorBoundary>
        </NetworkStatusProvider>
      </QueryClientProvider>
    </Provider>
  );
}
