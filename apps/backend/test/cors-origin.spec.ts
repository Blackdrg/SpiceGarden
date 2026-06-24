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

  it('returns true when origin is undefined or empty', () => {
    expect(isAllowedOrigin(undefined)).toBe(true);
    expect(isAllowedOrigin('')).toBe(true);
  });

  it('normalizes origin with trailing slash', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'https://customer.example.com/path/';

    expect(getAllowedOrigins()).toEqual(['https://customer.example.com']);
    expect(isAllowedOrigin('https://customer.example.com/path/')).toBe(true);
  });

  it('rejects invalid protocol origins', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3002,https://customer.example.com';

    expect(isAllowedOrigin('ftp://files.example.com')).toBe(false);
    expect(isAllowedOrigin('file:///etc/passwd')).toBe(false);
  });

  it('rejects malformed origin strings', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3002';

    expect(isAllowedOrigin('not a url')).toBe(false);
    expect(isAllowedOrigin('')).toBe(true);
  });

  it('returns default origins in development when env var is not set', () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    process.env.NODE_ENV = 'development';

    const origins = getAllowedOrigins();

    expect(origins.length).toBeGreaterThan(0);
    expect(origins).toContain('http://localhost:3002');
  });
});
