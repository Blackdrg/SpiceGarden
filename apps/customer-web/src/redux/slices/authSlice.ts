import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  email?: string;
  fullName?: string;
  phone?: string;
  name?: string;
  token?: string;
  profileImage?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('sg_token:v1', action.payload.token);
      localStorage.setItem('sg_user:v1', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('sg_token:v1');
      localStorage.removeItem('sg_user:v1');
    },
    refreshToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      localStorage.setItem('sg_token:v1', action.payload.token);
    },
    updateUser: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      localStorage.setItem('sg_user:v1', JSON.stringify(action.payload.user));
    },
  },
});

export const { setCredentials, logout, refreshToken, updateUser } = authSlice.actions;
export default authSlice.reducer;
