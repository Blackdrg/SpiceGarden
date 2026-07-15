import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../src/components/ProtectedRoute';

const mockAuth = {
  user: null as null | { email?: string },
  isAuthenticated: false,
  hydrated: true,
  login: jest.fn(),
  logout: jest.fn(),
};

const mockRouter = { pathname: '/', replace: jest.fn() };

jest.mock('../src/auth/useAuth', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('ProtectedRoute (super-admin)', () => {
  it('renders nothing when not authenticated after hydration', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.hydrated = true;
    const replace = mockRouter.replace as jest.Mock;

    const { container } = render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(replace).not.toHaveBeenCalled();
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
