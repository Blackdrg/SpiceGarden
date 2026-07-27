import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { AuthContext } from './useAuth';
import type { AuthUser, AuthContextValue, LoginResult } from './authTypes';


async function fetchCurrentUser(): Promise<any | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const loadCurrentUser = useCallback(async (signal: { active: boolean }) => {
    try {
      const res = await fetch("/api/auth/me");
      if (!signal.active) return;
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user as AuthUser);
        }
      }
      setHydrated(true);
    } catch {
      if (signal.active) setHydrated(true);
    }
  }, []);

  useEffect(() => {
    const signal = { active: true };
    loadCurrentUser(signal);
    return () => {
      signal.active = false;
    };
  }, [loadCurrentUser]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceName: 'super-admin', deviceType: 'browser' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: (data as { error?: string }).error || 'Login failed' };
      }
      const data = await res.json();
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
