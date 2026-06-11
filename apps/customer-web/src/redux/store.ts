import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { type AuthState } from './slices/authSlice';
import cartReducer from './slices/cartSlice';

export type RootState = {
  auth: AuthState;
  cart: ReturnType<typeof cartReducer>;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
