import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getCachedToken } from '../utils/cachedLocalStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = user?.token || getCachedToken();

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
