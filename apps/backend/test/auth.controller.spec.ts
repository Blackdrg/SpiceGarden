import { describe, expect, it, beforeEach } from '@jest/globals';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '../src/services/auth/auth.controller';
import { AuthService } from '../src/services/auth/auth.service';
import { UserEntity } from '../src/db/entities/user.entity';

function createMockRes() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    status: jest.fn(function status(this: any, _statusCode: number) { return this; }),
    sendStatus: jest.fn(),
    links: {},
    send: jest.fn(),
    json: jest.fn(function json(this: any, _body: unknown) { return this; }),
    redirect: jest.fn(function redirect(this: any, _url: string) { return this; }),
    setHeader: jest.fn(),
    getHeader: jest.fn(),
    removeHeader: jest.fn(),
    locals: {},
    req: {},
    res: {},
  } as any;
}

function createController(deps: {
  userRepo?: any;
  authService?: any;
  passwordResetService?: any;
  notificationService?: any;
  configService?: any;
  otpService?: any;
}) {
  const userRepo = deps.userRepo || { findOne: jest.fn(), findOneBy: jest.fn(), create: jest.fn(), save: jest.fn() };
  const authService = deps.authService || {
    hashPassword: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    revokeSession: jest.fn(),
    loginWithMfa: jest.fn(),
    loginWithSocial: jest.fn(),
  };
  const passwordResetService = deps.passwordResetService || {
    forgotPassword: jest.fn(),
    verifyResetCode: jest.fn(),
    resetPassword: jest.fn(),
  };
  const notificationService = deps.notificationService || { sendEmail: jest.fn(), sendSMS: jest.fn() };
  const configService = deps.configService || { get: jest.fn().mockReturnValue('http://localhost:3000') };
  const otpService = deps.otpService || { requestOtp: jest.fn(), verifyOtp: jest.fn() };
  const controller = new AuthController(authService, passwordResetService, otpService, userRepo, notificationService, configService);
  return { controller, userRepo, authService, passwordResetService, notificationService, configService, otpService };
}

describe('AuthController account edge cases', () => {
  let userRepo: any;
  let authService: any;
  let passwordResetService: any;
  let notificationService: any;
  let controller: AuthController;

  beforeEach(() => {
    userRepo = { findOne: jest.fn(), findOneBy: jest.fn(), create: jest.fn(), save: jest.fn() };
    authService = {
      hashPassword: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      refreshAccessToken: jest.fn(),
      revokeSession: jest.fn(),
      loginWithMfa: jest.fn(),
      loginWithSocial: jest.fn(),
    };
    passwordResetService = { forgotPassword: jest.fn(), verifyResetCode: jest.fn(), resetPassword: jest.fn() };
    notificationService = { sendEmail: jest.fn(), sendSMS: jest.fn() };
    controller = createController({ userRepo, authService, passwordResetService, notificationService }).controller;
  });

  it('rejects duplicate email registration with a conflict response', async () => {
    authService.hashPassword.mockResolvedValue('hash');
    userRepo.create.mockReturnValue({ email: 'test@example.com' });
    userRepo.save.mockRejectedValue({ code: '23505' });

    await expect(controller.register({
      email: 'test@example.com',
      password: 'secret',
      phone: '+15555555555',
      fullName: 'Test User',
    }, { ip: '127.0.0.1' } as any, createMockRes())).rejects.toThrow(ConflictException);

    expect(authService.hashPassword).toHaveBeenCalled();
    expect(userRepo.create).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
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

  it('throws conflict when save fails with duplicate key (23505)', async () => {
    userRepo.findOne.mockResolvedValue(null);
    authService.hashPassword.mockResolvedValue('hash');
    userRepo.create.mockReturnValue({ email: 'test@example.com' });
    userRepo.save.mockRejectedValue({ code: '23505' });

    await expect(controller.register({
      email: 'test@example.com', password: 'secret', phone: '+15555555555', fullName: 'Test User',
    }, { ip: '127.0.0.1' } as any, createMockRes())).rejects.toThrow(ConflictException);
  });

  it('rethrows non-duplicate save errors', async () => {
    userRepo.findOne.mockResolvedValue(null);
    authService.hashPassword.mockResolvedValue('hash');
    userRepo.create.mockReturnValue({ email: 'test@example.com' });
    userRepo.save.mockRejectedValue(new Error('boom'));

    await expect(controller.register({
      email: 'test@example.com', password: 'secret', phone: '+15555555555', fullName: 'Test User',
    }, { ip: '127.0.0.1' } as any, createMockRes())).rejects.toThrow('boom');
  });

  it('uses AuthService validation for login failures', async () => {
    authService.validateUser.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

    await expect(controller.login({ email: 'test@example.com', password: 'wrong' }, { ip: '127.0.0.1' } as any, createMockRes()))
      .rejects.toThrow(UnauthorizedException);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('logs in successfully and sets cookies when MFA is disabled', async () => {
    authService.validateUser.mockResolvedValue({ id: 'u1', email: 'test@example.com', fullName: 'T', role: 'customer', status: 'active', isMfaEnabled: false });
    authService.login.mockResolvedValue({ access_token: 'a', refresh_token: 'r' });
    const mockRes = createMockRes();

    const result = await controller.login({ email: 'test@example.com', password: 'pw' }, { ip: '127.0.0.1' } as any, mockRes);

    expect(result.access_token).toBe('a');
    expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'a', expect.any(Object));
    expect(mockRes.cookie).toHaveBeenCalledWith('refresh_token', 'r', expect.any(Object));
  });

  it('returns an MFA challenge when MFA is enabled', async () => {
    authService.validateUser.mockResolvedValue({ id: 'u1', email: 'test@example.com', isMfaEnabled: true });

    const result = await controller.login({ email: 'test@example.com', password: 'pw' }, { ip: '127.0.0.1' } as any, createMockRes());

    expect(result.mfaRequired).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('verifies MFA login and sets cookies', async () => {
    userRepo.findOneBy.mockResolvedValue({ id: 'u1', email: 'test@example.com', fullName: 'T', role: 'customer', status: 'active' });
    authService.loginWithMfa.mockResolvedValue({ access_token: 'a', refresh_token: 'r' });
    const mockRes = createMockRes();

    const result = await controller.verifyMfaLogin({ email: 'test@example.com', code: '123456' }, { ip: '127.0.0.1' } as any, mockRes);

    expect(result.access_token).toBe('a');
    expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'a', expect.any(Object));
    expect(authService.loginWithMfa).toHaveBeenCalledWith(
      { id: 'u1', email: 'test@example.com', fullName: 'T', role: 'customer', status: 'active' },
      '123456',
      { name: 'any Device', type: 'any Type', ip: '127.0.0.1' },
    );
  });

  it('rejects MFA login for unknown user', async () => {
    userRepo.findOneBy.mockResolvedValue(null);
    await expect(controller.verifyMfaLogin({ email: 'x@y.com', code: '123456' }, { ip: '127.0.0.1' } as any, createMockRes()))
      .rejects.toThrow(UnauthorizedException);
  });

  it('requests an OTP through the otp service', async () => {
    const otpService = { requestOtp: jest.fn().mockResolvedValue({ sent: true }), verifyOtp: jest.fn() };
    const { controller: c } = createController({ otpService });
    const result = await c.requestOtp({ email: 'test@example.com' });
    expect(otpService.requestOtp).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual({ sent: true });
  });

  it('verifies OTP and sets cookies when tokens are returned', async () => {
    const otpService = { requestOtp: jest.fn(), verifyOtp: jest.fn().mockResolvedValue({ access_token: 'a', refresh_token: 'r' }) };
    const { controller: c } = createController({ otpService });
    const mockRes = createMockRes();
    const result = await c.verifyOtp({ email: 'test@example.com', code: '123456' }, { ip: '127.0.0.1' } as any, mockRes);
    expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'a', expect.any(Object));
    expect(result.access_token).toBe('a');
  });

  it('verifies OTP without setting cookies when no tokens returned', async () => {
    const otpService = { requestOtp: jest.fn(), verifyOtp: jest.fn().mockResolvedValue({ verified: true }) };
    const { controller: c } = createController({ otpService });
    const mockRes = createMockRes();
    const result = await c.verifyOtp({ email: 'test@example.com', code: '123456' }, { ip: '127.0.0.1' } as any, mockRes);
    expect(mockRes.cookie).not.toHaveBeenCalled();
    expect(result).toEqual({ verified: true });
  });

  it('rejects refresh when no refresh token cookie is present', async () => {
    await expect(controller.refreshToken({ cookies: {}, ip: '127.0.0.1' } as any, createMockRes()))
      .rejects.toThrow(UnauthorizedException);
  });

  it('refreshes tokens and sets cookies', async () => {
    authService.refreshAccessToken.mockResolvedValue({ access_token: 'a', refresh_token: 'r' });
    const mockRes = createMockRes();
    const result = await controller.refreshToken({ cookies: { refresh_token: 'r' }, ip: '127.0.0.1' } as any, mockRes);
    expect(result.refresh_token).toBe('r');
    expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'a', expect.any(Object));
    expect(mockRes.cookie).toHaveBeenCalledWith('refresh_token', 'r', expect.any(Object));
  });

  it('revokes session on logout when refresh token present', async () => {
    const mockRes = createMockRes();
    const result = await controller.logout({ cookies: { refresh_token: 'r' }, ip: '127.0.0.1' } as any, mockRes);
    expect(authService.revokeSession).toHaveBeenCalledWith('r');
    expect(mockRes.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' });
    expect(result.revoked).toBe(true);
  });

  it('logs out without revoking when no refresh token', async () => {
    const mockRes = createMockRes();
    const result = await controller.logout({ cookies: {}, ip: '127.0.0.1' } as any, mockRes);
    expect(authService.revokeSession).not.toHaveBeenCalled();
    expect(result.revoked).toBe(true);
  });

  it('returns current user from guard-injected request', async () => {
    const result = await controller.me({ user: { id: 'u1', email: 't@e.com', fullName: 'T', role: 'customer', status: 'active', isMfaEnabled: true } } as any);
    expect(result.user.isMfaEnabled).toBe(true);
  });

  it('rejects me when no user is present', async () => {
    await expect(controller.me({} as any)).rejects.toThrow(UnauthorizedException);
  });

  it('returns generic message on forgot-password with missing email', async () => {
    const result = await controller.forgotPassword({ email: '' });
    expect(result.message).toContain('If your email exists');
    expect(passwordResetService.forgotPassword).not.toHaveBeenCalled();
  });

  it('triggers password reset email on forgot-password', async () => {
    const result = await controller.forgotPassword({ email: 'test@example.com' });
    expect(passwordResetService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    expect(result.message).toContain('If your email exists');
  });

  it('requires email and code on verify-reset-code', async () => {
    await expect(controller.verifyResetCode({ email: '', code: '' })).rejects.toThrow(BadRequestException);
  });

  it('verifies reset code and returns valid', async () => {
    passwordResetService.verifyResetCode.mockResolvedValue(true);
    const result = await controller.verifyResetCode({ email: 't@e.com', code: '123456' });
    expect(result.valid).toBe(true);
  });

  it('requires fields on reset-password', async () => {
    await expect(controller.resetPassword({ email: '', code: '', password: '' })).rejects.toThrow(BadRequestException);
  });

  it('rejects short passwords on reset-password', async () => {
    await expect(controller.resetPassword({ email: 't@e.com', code: '123456', password: 'short' })).rejects.toThrow(BadRequestException);
  });

  it('resets password successfully', async () => {
    const result = await controller.resetPassword({ email: 't@e.com', code: '123456', password: 'longenough' });
    expect(passwordResetService.resetPassword).toHaveBeenCalledWith('t@e.com', '123456', 'longenough');
    expect(result.success).toBe(true);
  });

  it('logs in via google social callback and redirects', async () => {
    authService.loginWithSocial.mockResolvedValue({ access_token: 'a', refresh_token: 'r' });
    const mockRes = createMockRes();
    const result = await controller.googleAuthCallback({ user: { email: 'g@e.com', fullName: 'G User', id: 'gid' } } as any, mockRes);
    expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'a', expect.any(Object));
    expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:3000/');
    expect(result).toBe(mockRes);
  });

  it('logs in via facebook social callback with composed full name', async () => {
    authService.loginWithSocial.mockResolvedValue({ access_token: 'a', refresh_token: 'r' });
    const mockRes = createMockRes();
    const result = await controller.facebookAuthCallback({
      user: { email: 'f@e.com', id: 'fid', name: { givenName: 'F', familyName: 'B' } },
    } as any, mockRes);
    expect(authService.loginWithSocial).toHaveBeenCalledWith({
      email: 'f@e.com', fullName: 'F B', socialId: 'fid', socialProvider: 'facebook',
    });
    expect(result).toBe(mockRes);
  });
});
