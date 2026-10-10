import { describe, expect, it, beforeEach } from '@jest/globals';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../src/services/auth/auth.controller';

function createMockRes() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    status: jest.fn(function status(this: any, _statusCode: number) { return this; }),
    sendStatus: jest.fn(),
    links: {},
    send: jest.fn(),
    json: jest.fn(function json(this: any, _body: unknown) { return this; }),
    setHeader: jest.fn(),
    getHeader: jest.fn(),
    removeHeader: jest.fn(),
    redirect: jest.fn(),
    locals: {},
    req: {},
    res: {},
  } as any;
}

function createController(userRepo: any, authService: any, passwordResetService: any, notificationService: any, configService: any = { get: () => 'http://localhost:3000' }) {
  return {
    controller: new AuthController(authService, passwordResetService, userRepo, notificationService, configService),
    userRepo,
    authService,
    passwordResetService,
    notificationService,
  };
}

describe('AuthController', () => {
  let userRepo: any;
  let authService: any;
  let passwordResetService: any;
  let notificationService: any;
  let configService: any;
  let controller: AuthController;

  beforeEach(() => {
    userRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    authService = {
      hashPassword: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      refreshAccessToken: jest.fn(),
      revokeSession: jest.fn(),
      loginWithSocial: jest.fn(),
    };
    passwordResetService = {
      forgotPassword: jest.fn(),
      verifyResetCode: jest.fn(),
      resetPassword: jest.fn(),
    };
    notificationService = {
      sendEmail: jest.fn(),
      sendSMS: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string, defaultVal?: any) => {
        if (key === 'SESSION_DURATION_DAYS') return 30;
        if (key === 'NODE_ENV') return 'development';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        return defaultVal;
      }),
    };
    controller = new AuthController(authService, passwordResetService, userRepo, notificationService, configService);
  });

  describe('register', () => {
    it('rejects duplicate email registration with a conflict response', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'existing-user', email: 'test@example.com' });

      await expect(controller.register({
        email: 'test@example.com',
        password: 'secret',
        phone: '+15555555555',
        fullName: 'Test User',
      }, { ip: '127.0.0.1' } as any, createMockRes())).rejects.toThrow(ConflictException);

      expect(authService.hashPassword).not.toHaveBeenCalled();
      expect(userRepo.create).not.toHaveBeenCalled();
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('registers a new user and returns login tokens', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({ id: 'new-user', email: 'test@example.com', phone: '+15555555555', fullName: 'Test User', passwordHash: 'hash' });
      userRepo.save.mockResolvedValue({ id: 'new-user', email: 'test@example.com', role: 'customer', status: 'active' });
      authService.hashPassword.mockResolvedValue('hash');
      authService.login.mockResolvedValue({ access_token: 'access', refresh_token: 'refresh' });
      const mockRes = createMockRes();

      const result = await controller.register({
        email: 'test@example.com',
        password: 'secret',
        phone: '+15555555555',
        fullName: 'Test User',
      }, { ip: '127.0.0.1' } as any, mockRes);

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('customer');
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'access', expect.any(Object));
      expect(mockRes.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.any(Object));
      expect(authService.login).toHaveBeenCalledWith(
        { id: 'new-user', email: 'test@example.com', role: 'customer', status: 'active' },
        { name: 'any Device', type: 'any Type', ip: '127.0.0.1' },
      );
    });
  });

  describe('login', () => {
    it('uses AuthService validation for login failures', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login({ email: 'test@example.com', password: 'wrong' }, { ip: '127.0.0.1' } as any, createMockRes()))
        .rejects.toThrow(UnauthorizedException);

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('successfully logs in user and sets cookies', async () => {
      const user = { id: 'u1', email: 'test@example.com', fullName: 'User One', role: 'customer', status: 'active' };
      authService.validateUser.mockResolvedValue(user);
      authService.login.mockResolvedValue({ access_token: 'acc1', refresh_token: 'ref1' });
      const mockRes = createMockRes();

      const res = await controller.login({ email: 'test@example.com', password: 'pass', deviceName: 'iPhone', deviceType: 'mobile' }, { ip: '192.168.1.1' } as any, mockRes);

      expect(res.access_token).toBe('acc1');
      expect(res.user.id).toBe('u1');
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'acc1', expect.any(Object));
    });
  });

  describe('refreshToken', () => {
    it('throws UnauthorizedException if no refresh token cookie is present', async () => {
      const req = { cookies: {} } as any;
      await expect(controller.refreshToken(req, createMockRes())).rejects.toThrow(UnauthorizedException);
    });

    it('refreshes token successfully', async () => {
      const req = { cookies: { refresh_token: 'old_ref' }, ip: '10.0.0.1' } as any;
      authService.refreshAccessToken.mockResolvedValue({ access_token: 'new_acc', refresh_token: 'new_ref' });
      const mockRes = createMockRes();

      const res = await controller.refreshToken(req, mockRes);
      expect(res.refresh_token).toBe('new_ref');
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'new_acc', expect.any(Object));
    });
  });

  describe('logout', () => {
    it('revokes session if refresh_token present and clears cookies', async () => {
      const req = { cookies: { refresh_token: 'tok' } } as any;
      const mockRes = createMockRes();

      const res = await controller.logout(req, mockRes);
      expect(authService.revokeSession).toHaveBeenCalledWith('tok');
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.revoked).toBe(true);
    });

    it('clears cookies even if no refresh_token is provided', async () => {
      const req = { cookies: {} } as any;
      const mockRes = createMockRes();

      const res = await controller.logout(req, mockRes);
      expect(authService.revokeSession).not.toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.revoked).toBe(true);
    });
  });

  describe('me', () => {
    it('throws UnauthorizedException if req.user is undefined', async () => {
      const req = {} as any;
      await expect(controller.me(req)).rejects.toThrow(UnauthorizedException);
    });

    it('returns user details if req.user exists', async () => {
      const req = { user: { id: 'u1', email: 'test@example.com', fullName: 'Test', role: 'customer', status: 'active' } } as any;
      const res = await controller.me(req);
      expect(res.user.id).toBe('u1');
      expect(res.user.email).toBe('test@example.com');
    });
  });

  describe('forgotPassword', () => {
    it('returns generic message without calling service if email is empty', async () => {
      const res = await controller.forgotPassword({ email: '' });
      expect(res.message).toContain('If your email exists');
      expect(passwordResetService.forgotPassword).not.toHaveBeenCalled();
    });

    it('calls passwordResetService.forgotPassword when email is provided', async () => {
      const res = await controller.forgotPassword({ email: 'test@example.com' });
      expect(passwordResetService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(res.message).toContain('If your email exists');
    });
  });

  describe('verifyResetCode', () => {
    it('throws BadRequestException if email or code missing', async () => {
      await expect(controller.verifyResetCode({ email: '', code: '123' })).rejects.toThrow(BadRequestException);
      await expect(controller.verifyResetCode({ email: 'a@b.com', code: '' })).rejects.toThrow(BadRequestException);
    });

    it('calls verifyResetCode on service when valid', async () => {
      passwordResetService.verifyResetCode.mockResolvedValue(true);
      const res = await controller.verifyResetCode({ email: 'test@example.com', code: '123456' });
      expect(res.valid).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException if any field is missing', async () => {
      await expect(controller.resetPassword({ email: '', code: '123', password: 'pass' })).rejects.toThrow(BadRequestException);
      await expect(controller.resetPassword({ email: 'a@b.com', code: '', password: 'pass' })).rejects.toThrow(BadRequestException);
      await expect(controller.resetPassword({ email: 'a@b.com', code: '123', password: '' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if password is shorter than 8 characters', async () => {
      await expect(controller.resetPassword({ email: 'a@b.com', code: '123', password: 'short' })).rejects.toThrow(BadRequestException);
    });

    it('resets password successfully when fields are valid', async () => {
      const res = await controller.resetPassword({ email: 'a@b.com', code: '123456', password: 'validPassword123' });
      expect(passwordResetService.resetPassword).toHaveBeenCalledWith('a@b.com', '123456', 'validPassword123');
      expect(res.success).toBe(true);
    });
  });

  describe('OAuth handlers', () => {
    it('handles googleAuth stub', async () => {
      await expect(controller.googleAuth()).resolves.toBeUndefined();
    });

    it('handles facebookAuth stub', async () => {
      await expect(controller.facebookAuth()).resolves.toBeUndefined();
    });

    it('handles googleAuthCallback and redirects', async () => {
      const req = {
        user: { email: 'g@example.com', displayName: 'Google User', id: 'g123' },
      } as any;
      authService.loginWithSocial.mockResolvedValue({ access_token: 'g_acc', refresh_token: 'g_ref' });
      const mockRes = createMockRes();

      await controller.googleAuthCallback(req, mockRes);
      expect(authService.loginWithSocial).toHaveBeenCalledWith({
        email: 'g@example.com',
        fullName: 'Google User',
        socialId: 'g123',
        socialProvider: 'google',
      });
      expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:3000/');
    });

    it('handles facebookAuthCallback with structured name object and redirects', async () => {
      const req = {
        user: { email: 'fb@example.com', name: { givenName: 'Jane', familyName: 'Doe' }, id: 'fb123' },
      } as any;
      authService.loginWithSocial.mockResolvedValue({ access_token: 'fb_acc', refresh_token: 'fb_ref' });
      const mockRes = createMockRes();

      await controller.facebookAuthCallback(req, mockRes);
      expect(authService.loginWithSocial).toHaveBeenCalledWith({
        email: 'fb@example.com',
        fullName: 'Jane Doe',
        socialId: 'fb123',
        socialProvider: 'facebook',
      });
      expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:3000/');
    });
  });
});
