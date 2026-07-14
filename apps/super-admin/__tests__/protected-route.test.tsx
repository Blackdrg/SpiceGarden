import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../src/components/ProtectedRoute';

const mockAuth = {
  user: null as null | { email?: string },
  isAuthenticated: false,
  hydrated: true,
  login: jest.fn(),
  logout: jest.fn(),
};

const mockRouter = { pathname: '/', replace: jest.fn() };

jest.mock('../src/auth/AuthContext', () => ({
  useAuth: () => mockAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('ProtectedRoute (super-admin)', () => {
  it('redirects to /login when not authenticated', async () => {
    mockAuth.isAuthenticated = false;
    mockAuth.hydrated = true;
    const replace = mockRouter.replace as jest.Mock;

    const { container } = render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(container).toBeEmptyDOMElement();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
  });

  it('renders children when authenticated', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.hydrated = true;

    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('renders nothing before hydration completes', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.hydrated = false;

    const { container } = render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
