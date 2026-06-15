import { authApi } from '../api';

describe('authApi', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('posts login credentials with JSON content type', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { access_token: 'token', refresh_token: 'refresh', user: {} } }),
    });

    await authApi.login('user@example.com', 'password');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      }),
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers.get('Content-Type')).toBe('application/json');
  });
});
