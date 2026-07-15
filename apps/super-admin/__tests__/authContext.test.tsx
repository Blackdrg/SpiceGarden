import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../src/auth/AuthContext';
import { useAuth } from '../src/auth/useAuth';

function Harness() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'auth' : 'anon'}</span>
      <span data-testid="email">{user?.email || 'none'}</span>
      <button onClick={() => login('admin@spicegarden.com', 'pw')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  it('hydrates as anonymous when no session exists', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) } as any);
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));
  });

  it('logs in and exposes the authenticated user', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ user: { id: 'u1', email: 'admin@spicegarden.com', role: 'admin' } }) } as any);

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));

    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('auth'));
    expect(screen.getByTestId('email')).toHaveTextContent('admin@spicegarden.com');
  });

  it('reports failure when backend rejects login', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) } as any)
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Invalid credentials' }) } as any);

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));

    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('clears the user on logout', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ user: { id: 'u1', email: 'admin@spicegarden.com', role: 'admin' } }) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ revoked: true }) } as any);

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));

    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('auth'));

    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));
  });
});
