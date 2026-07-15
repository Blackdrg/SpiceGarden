export interface AuthUser {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
  status?: string;
  isMfaEnabled?: boolean;
  [key: string]: unknown;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  mfaRequired?: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}
