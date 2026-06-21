import { describe, expect, it, afterEach } from '@jest/globals';
import { getAllowedOrigins, isAllowedOrigin } from '../src/security/cors-origin';

describe('CORS origin normalization', () => {
  const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.CORS_ALLOWED_ORIGINS;
    } else {
      process.env.CORS_ALLOWED_ORIGINS = originalEnv;
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('normalizes allowed origins and strips paths', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3002, https://customer.example.com/path/';

    expect(getAllowedOrigins()).toEqual(['http://localhost:3002', 'https://customer.example.com']);
    expect(isAllowedOrigin('https://customer.example.com')).toBe(true);
  });

  it('rejects wildcard, null, and untrusted origins', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ALLOWED_ORIGINS = '*,http://localhost:3002';

    expect(getAllowedOrigins()).toEqual(['http://localhost:3002']);
    expect(isAllowedOrigin('http://evil.example')).toBe(false);
    expect(isAllowedOrigin('null')).toBe(false);
  });
});
