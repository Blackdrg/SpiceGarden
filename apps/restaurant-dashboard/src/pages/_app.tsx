import React, { useEffect, useCallback } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../redux/store';
import { setCredentials, setHydrated } from '../redux/slices/authSlice';
import { trackEvent, ToastProvider } from '@spicegarden/ui';
import Footer from './Footer';
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
  const isLoginPage = router.pathname === '/login';

  const loadCurrentUser = useCallback(async (signal: { active: boolean }) => {
    try {
      const res = await fetch("/api/auth/me");
      if (!signal.active) return;
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          dispatch(setCredentials({ user: data.user }));
        } else {
          dispatch(setHydrated(true));
        }
      } else {
        dispatch(setHydrated(true));
      }
    } catch {
      if (signal.active) dispatch(setHydrated(true));
    }
  }, [dispatch]);

  useEffect(() => {
    const signal = { active: true };
    loadCurrentUser(signal);
    return () => {
      signal.active = false;
    };
  }, [loadCurrentUser]);

  if (!hydrated) {
    return null;
  }

  if (!isLoginPage && !isAuthenticated) {
    return null;
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}

async function fetchCurrentUser(): Promise<any | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  return null;
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
