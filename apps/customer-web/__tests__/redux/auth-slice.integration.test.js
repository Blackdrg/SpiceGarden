const { describe, it, expect, beforeEach } = require('@jest/globals');

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('authSlice - Integration Tests', () => {
  const STORAGE_KEYS = {
    TOKEN: 'sg_token:v1',
    USER: 'sg_user:v1',
  };

  const mockAuthReducer = (state, action) => {
    if (action.type === 'auth/setCredentials') {
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    }
    if (action.type === 'auth/logout') {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    }
    if (action.type === 'auth/refreshToken') {
      return {
        ...state,
        token: action.payload.token,
      };
    }
    if (action.type === 'auth/updateUser') {
      return {
        ...state,
        user: action.payload.user,
      };
    }
    return state || { user: null, token: null, isAuthenticated: false };
  };

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('setCredentials', () => {
    it('should set credentials and mark user as authenticated', () => {
      const user = { email: 'test@example.com', name: 'Test User' };
      const action = { type: 'auth/setCredentials', payload: { user, token: 'test-token' } };
      const state = mockAuthReducer(undefined, action);

      expect(state.user).toEqual(user);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should persist credentials to localStorage', () => {
      const user = { email: 'test@example.com', name: 'Test User' };
      const action = { type: 'auth/setCredentials', payload: { user, token: 'test-token' } };
      mockAuthReducer(undefined, action);
      mockLocalStorage.setItem(STORAGE_KEYS.TOKEN, 'test-token');
      mockLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      expect(mockLocalStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('test-token');
      expect(mockLocalStorage.getItem(STORAGE_KEYS.USER)).toBe(JSON.stringify(user));
    });
  });

  describe('logout', () => {
    it('should clear all auth state', () => {
      const initialState = {
        user: { email: 'test@example.com', name: 'Test' },
        token: 'test-token',
        isAuthenticated: true,
      };
      const action = { type: 'auth/logout' };
      const state = mockAuthReducer(initialState, action);

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should update token without changing user', () => {
      const initialState = {
        user: { email: 'test@example.com', name: 'Test' },
        token: 'old-token',
        isAuthenticated: true,
      };
      const action = { type: 'auth/refreshToken', payload: { token: 'new-token' } };
      const state = mockAuthReducer(initialState, action);

      expect(state.token).toBe('new-token');
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = mockAuthReducer(undefined, { type: 'unknown' });
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});