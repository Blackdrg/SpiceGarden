import { describe, expect, it, afterEach, jest } from '@jest/globals';
import { csrfProtection, generateCsrfToken } from '../src/security/csrf.middleware';

describe('CSRF Protection', () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      path: '/api/test',
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    const originalEnv = process.env.NODE_ENV;
    if (originalEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalEnv;
    }
  });

  describe('csrfProtection', () => {
    it('should allow GET, HEAD, OPTIONS requests without CSRF token', () => {
      ['GET', 'HEAD', 'OPTIONS'].forEach((method) => {
        mockReq.method = method;
        mockNext = jest.fn();
        csrfProtection()(mockReq as any, mockRes as any, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should skip CSRF check for webhook paths', () => {
      ['/api/webhook', '/payments/webhook', '/api/webhook/test'].forEach((path) => {
        mockReq.path = path;
        mockNext = jest.fn();
        csrfProtection()(mockReq as any, mockRes as any, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should allow valid CSRF tokens in development', () => {
      process.env.NODE_ENV = 'development';

      const validToken = generateCsrfToken();
      (mockReq.headers as Record<string, string>)['x-csrf-token'] = validToken;
      (mockReq.cookies as Record<string, string>)['_csrf'] = validToken;

      csrfProtection()(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.header).toHaveBeenCalledWith('X-CSRF-Token', validToken);
    });

    it('should reject missing CSRF tokens in production', () => {
      process.env.NODE_ENV = 'production';

      csrfProtection()(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'CSRF token missing' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject CSRF token mismatch in production', () => {
      process.env.NODE_ENV = 'production';

      (mockReq.headers as Record<string, string>)['x-csrf-token'] = 'header-token';
      (mockReq.cookies as Record<string, string>)['_csrf'] = 'cookie-token';

      csrfProtection()(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'CSRF token mismatch' });
    });

    it('should reject expired JWT-style CSRF tokens in production', () => {
      process.env.NODE_ENV = 'production';

      const expiredToken = 'header.eyJleHAiOjF9.signature';
      (mockReq.headers as Record<string, string>)['x-csrf-token'] = expiredToken;
      (mockReq.cookies as Record<string, string>)['_csrf'] = expiredToken;

      csrfProtection()(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'CSRF token expired' });
    });

    it('should reject tokens with invalid format in production', () => {
      process.env.NODE_ENV = 'production';

      (mockReq.headers as Record<string, string>)['x-csrf-token'] = 'short';
      (mockReq.cookies as Record<string, string>)['_csrf'] = 'short';

      csrfProtection()(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'CSRF token invalid format' });
    });

    it('should allow valid CSRF tokens in production', () => {
      process.env.NODE_ENV = 'production';

      const validToken = generateCsrfToken();
      (mockReq.headers as Record<string, string>)['x-csrf-token'] = validToken;
      (mockReq.cookies as Record<string, string>)['_csrf'] = validToken;

      csrfProtection()(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.header).toHaveBeenCalledWith('X-CSRF-Token', validToken);
    });

    it('should generate cryptographically secure tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      expect(token1).toHaveLength(44);
      expect(token2).toHaveLength(44);
      expect(token1).not.toBe(token2);
      expect(/^[a-zA-Z0-9+/=]+$/.test(token1)).toBe(true);
    });
  });
});