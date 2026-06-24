import { API_URL, SOCKET_URL } from '../constants';

describe('shared constants', () => {
  it('exports stable service endpoints', () => {
    expect(API_URL).toBe('http://localhost:3001');
    expect(SOCKET_URL).toBe('http://localhost:3001');
  });
});
