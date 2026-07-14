import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
