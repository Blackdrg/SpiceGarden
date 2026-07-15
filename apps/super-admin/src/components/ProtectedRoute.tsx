import { useAuth } from '../auth/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, hydrated } = useAuth();

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
