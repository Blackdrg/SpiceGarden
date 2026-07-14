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
  isMfaEnabled?: boolean;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.hydrated = true;
    },
    setUser: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setHydrated } = authSlice.actions;
export default authSlice.reducer;
