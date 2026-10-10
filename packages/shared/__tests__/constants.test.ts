import { API_URL, SOCKET_URL } from '../constants';

describe('shared constants', () => {
  it('does not silently fall back to localhost when env vars are missing', () => {
    expect(API_URL).not.toContain('localhost');
    expect(SOCKET_URL).not.toContain('localhost');
  });
});
