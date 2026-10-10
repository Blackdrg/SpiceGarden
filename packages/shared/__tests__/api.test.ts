import { authApi } from '../api';

describe('authApi', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
    jest.resetModules();
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it('posts login credentials with JSON content type', async () => {
    const { authApi } = await import('../api');

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { access_token: 'token', refresh_token: 'refresh', user: {} } }),
    });

    await authApi.login('user@example.com', 'password');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      }),
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers.get('Content-Type')).toBe('application/json');
  });
});
