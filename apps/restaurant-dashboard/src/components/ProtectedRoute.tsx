import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return <>{children}</>;
}
