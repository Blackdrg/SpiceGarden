import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  email?: string;
  fullName?: string;
  phone?: string;
  name?: string;
  profileImage?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  id?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const defaultUser: User = {
  id: 'cust-001',
  fullName: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  phone: '+91 98765 43210',
  role: 'customer',
  status: 'active',
  emailVerified: true,
  phoneVerified: true,
  createdAt: '2026-01-15T08:00:00.000Z',
};

const initialState: AuthState = {
  user: defaultUser,
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
    },
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
