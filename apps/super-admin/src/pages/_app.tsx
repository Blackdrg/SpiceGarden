import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trackEvent, ToastProvider } from '@spicegarden/ui';
import * as Sentry from '@sentry/nextjs';
import { AuthProvider } from '../auth/AuthContext';
import { useAuth } from '../auth/useAuth';
import { LegalFooter } from '../components/LegalFooter';

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.0,
    profilesSampleRate: 0.0,
  });
}

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  if (!hydrated) {
    return null;
  }

  if (!isLoginPage && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    trackEvent({ event: 'page_view', properties: { url: window?.location?.href } });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Sentry.ErrorBoundary fallback={<p>An error occurred</p>}>
          <AuthProvider>
            <AuthGate>
              <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
                <Component {...pageProps} />
                <LegalFooter />
              </div>
            </AuthGate>
          </AuthProvider>
        </Sentry.ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
