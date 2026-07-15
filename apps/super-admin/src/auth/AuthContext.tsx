import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { AuthContext } from './useAuth';
import type { AuthUser, AuthContextValue, LoginResult } from './authTypes';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.user) {
          setUser(data.user as AuthUser);
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceName: 'super-admin', deviceType: 'browser' }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { ok: false, error: (data as { error?: string }).error || 'Login failed' };
      }
      if ((data as { mfaRequired?: boolean }).mfaRequired) {
        return { ok: false, mfaRequired: true, error: 'MFA is required for this account' };
      }

      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        return { ok: false, error: 'Session could not be established' };
      }
      const me = await meRes.json();
      setUser(((me as { user?: AuthUser }).user as AuthUser) || null);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to reach the authentication service' };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, hydrated, login, logout }),
    [user, hydrated, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
