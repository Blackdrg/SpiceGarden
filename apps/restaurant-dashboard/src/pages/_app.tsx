import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../redux/store';
import { setCredentials, setHydrated } from '../redux/slices/authSlice';
import { trackEvent, ToastProvider } from '@spicegarden/ui';
import * as Sentry from '@sentry/nextjs';

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.0,
    profilesSampleRate: 0.0,
  });
}

const queryClient = new QueryClient();

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: ReturnType<typeof store.getState>) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: ReturnType<typeof store.getState>) => state.auth.hydrated);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.user) {
          dispatch(setCredentials({ user: data.user }));
        } else {
          dispatch(setHydrated(true));
        }
      })
      .catch(() => {
        if (!cancelled) dispatch(setHydrated(true));
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    setChecked(true);
    const isLoginPage = router.pathname === '/login';
    if (isLoginPage && isAuthenticated) {
      router.replace('/');
    } else if (!isLoginPage && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !checked) {
    return null;
  }

  return <>{children}</>;
}

export default function RestaurantApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    trackEvent({ event: 'page_view', properties: { url: window?.location?.href } });
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Sentry.ErrorBoundary fallback={<p>An error occurred</p>}>
            <AuthHydrator>
              <Component {...pageProps} />
            </AuthHydrator>
          </Sentry.ErrorBoundary>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}
