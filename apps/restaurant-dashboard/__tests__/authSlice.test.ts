import authReducer, { setCredentials, setUser, logout, setHydrated, AuthState } from '../src/redux/slices/authSlice';

const baseUser = { id: 'r1', email: 'rest@e.com', fullName: 'Rest', role: 'restaurant', status: 'active' };

describe('authSlice', () => {
  const initialState: AuthState = { user: null, isAuthenticated: false, hydrated: false };

  it('sets credentials and marks authenticated + hydrated', () => {
    const state = authReducer(initialState, setCredentials({ user: baseUser }));
    expect(state.user).toEqual(baseUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.hydrated).toBe(true);
  });

  it('updates the user without changing auth flag', () => {
    const authed = authReducer(initialState, setCredentials({ user: baseUser }));
    const updated = authReducer(authed, setUser({ user: { ...baseUser, fullName: 'Updated' } }));
    expect(updated.user?.fullName).toBe('Updated');
    expect(updated.isAuthenticated).toBe(true);
  });

  it('clears user and auth on logout', () => {
    const authed = authReducer(initialState, setCredentials({ user: baseUser }));
    const cleared = authReducer(authed, logout());
    expect(cleared.user).toBeNull();
    expect(cleared.isAuthenticated).toBe(false);
  });

  it('sets hydrated flag independently', () => {
    const state = authReducer(initialState, setHydrated(true));
    expect(state.hydrated).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });
});
