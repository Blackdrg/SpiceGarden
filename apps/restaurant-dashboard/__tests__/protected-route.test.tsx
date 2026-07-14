import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/redux/slices/authSlice';
import ProtectedRoute from '../src/components/ProtectedRoute';

function makeStore(preloadedState: any) {
  return configureStore({ reducer: { auth: authReducer }, preloadedState });
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing before hydration completes', () => {
    const store = makeStore({ auth: { user: null, isAuthenticated: false, hydrated: false } });
    const { container } = render(
      <Provider store={store}>
        <ProtectedRoute>
          <div>secret</div>
        </ProtectedRoute>
      </Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders children when authenticated', () => {
    const store = makeStore({ auth: { user: { id: 'r1' }, isAuthenticated: true, hydrated: true } });
    render(
      <Provider store={store}>
        <ProtectedRoute>
          <div>secret</div>
        </ProtectedRoute>
      </Provider>,
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated after hydration', () => {
    delete (window as any).location;
    (window as any).location = { href: '' };
    const store = makeStore({ auth: { user: null, isAuthenticated: false, hydrated: true } });
    render(
      <Provider store={store}>
        <ProtectedRoute>
          <div>secret</div>
        </ProtectedRoute>
      </Provider>,
    );
    expect(window.location.href).toBe('/login');
  });
});
