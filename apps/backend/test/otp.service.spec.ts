import { describe, expect, it, beforeEach } from '@jest/globals';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { OtpService } from '../src/services/auth/otp.service';
import { OtpStatus, OtpType } from '../src/db/entities/otp.entity';

function createService() {
  const userRepo = { findOne: jest.fn() };
  const otpRepo = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    save: jest.fn().mockResolvedValue({ id: 'otp-1' }),
    findOne: jest.fn(),
  };
  const notificationService = { sendSMS: jest.fn(), sendEmail: jest.fn() };
  const authService = {
    login: jest.fn().mockResolvedValue({ access_token: 'access', refresh_token: 'refresh' }),
  };
  const configService = { get: (_key: string, fallback: unknown) => fallback };

  const service = new OtpService(
    configService as any,
    userRepo as any,
    otpRepo as any,
    notificationService as any,
    authService as any,
  );

  return { service, userRepo, otpRepo, notificationService, authService };
}

const deviceInfo = { name: 'dev', type: 'test', ip: '127.0.0.1' };

describe('OtpService', () => {
  let ctx: ReturnType<typeof createService>;

  beforeEach(() => {
    ctx = createService();
  });

  it('requires an email to request a code', async () => {
    await expect(ctx.service.requestOtp('')).rejects.toThrow(BadRequestException);
  });

  it('returns a generic message without sending when the account does not exist', async () => {
    ctx.userRepo.findOne.mockResolvedValue(null);

    const result = await ctx.service.requestOtp('missing@example.com');

    expect(result.message).toContain('If an account exists');
    expect(ctx.otpRepo.save).not.toHaveBeenCalled();
    expect(ctx.notificationService.sendSMS).not.toHaveBeenCalled();
    expect(ctx.notificationService.sendEmail).not.toHaveBeenCalled();
  });

  it('generates a login code and delivers it via SMS when a phone exists', async () => {
    ctx.userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.com', phone: '+15555555555' });

    await ctx.service.requestOtp('a@b.com');

    expect(ctx.otpRepo.update).toHaveBeenCalledWith(
      { userId: 'u1', type: OtpType.LOGIN, status: OtpStatus.PENDING },
      { status: OtpStatus.EXPIRED },
    );
    expect(ctx.otpRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', type: OtpType.LOGIN, status: OtpStatus.PENDING }),
    );
    const savedCode = (ctx.otpRepo.save as jest.Mock).mock.calls[0][0].code;
    expect(savedCode).toMatch(/^\d{6}$/);
    expect(ctx.notificationService.sendSMS).toHaveBeenCalled();
  });

  it('falls back to email for social accounts without a real phone', async () => {
    ctx.userRepo.findOne.mockResolvedValue({ id: 'u2', email: 'c@d.com', phone: 'social-123' });

    await ctx.service.requestOtp('c@d.com');

    expect(ctx.notificationService.sendEmail).toHaveBeenCalled();
    expect(ctx.notificationService.sendSMS).not.toHaveBeenCalled();
  });

  it('rejects verification when no pending code exists', async () => {
    ctx.userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    ctx.otpRepo.findOne.mockResolvedValue(null);

    await expect(ctx.service.verifyOtp('a@b.com', '123456', deviceInfo)).rejects.toThrow(UnauthorizedException);
  });

  it('expires and rejects a code past its expiry', async () => {
    ctx.userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    ctx.otpRepo.findOne.mockResolvedValue({
      id: 'otp-1',
      code: '123456',
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(ctx.service.verifyOtp('a@b.com', '123456', deviceInfo)).rejects.toThrow('Code has expired');
    expect(ctx.otpRepo.update).toHaveBeenCalledWith('otp-1', { status: OtpStatus.EXPIRED });
  });

  it('rejects an incorrect code', async () => {
    ctx.userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    ctx.otpRepo.findOne.mockResolvedValue({
      id: 'otp-1',
      code: '123456',
      expiresAt: new Date(Date.now() + 60000),
    });

    await expect(ctx.service.verifyOtp('a@b.com', '000000', deviceInfo)).rejects.toThrow(UnauthorizedException);
    expect(ctx.authService.login).not.toHaveBeenCalled();
  });

  it('issues tokens on a valid code', async () => {
    ctx.userRepo.findOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      fullName: 'A B',
      role: 'customer',
      status: 'active',
      isMfaEnabled: false,
      passwordHash: 'hash',
    });
    ctx.otpRepo.findOne.mockResolvedValue({
      id: 'otp-1',
      code: '123456',
      expiresAt: new Date(Date.now() + 60000),
    });

    const result = await ctx.service.verifyOtp('a@b.com', '123456', deviceInfo);

    expect(result.access_token).toBe('access');
    expect(result.refresh_token).toBe('refresh');
    expect(result.user?.email).toBe('a@b.com');
    expect(ctx.otpRepo.update).toHaveBeenCalledWith('otp-1', expect.objectContaining({ status: OtpStatus.VERIFIED }));
  });

  it('returns an MFA challenge instead of tokens when MFA is enabled', async () => {
    ctx.userRepo.findOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      isMfaEnabled: true,
      passwordHash: 'hash',
    });
    ctx.otpRepo.findOne.mockResolvedValue({
      id: 'otp-1',
      code: '123456',
      expiresAt: new Date(Date.now() + 60000),
    });

    const result = await ctx.service.verifyOtp('a@b.com', '123456', deviceInfo);

    expect(result.mfaRequired).toBe(true);
    expect(result.access_token).toBeUndefined();
    expect(ctx.authService.login).not.toHaveBeenCalled();
  });

  describe('requestDeliveryOtp', () => {
    it('requires an orderId', async () => {
      await expect(ctx.service.requestDeliveryOtp('')).rejects.toThrow(BadRequestException);
    });

    it('expires pending delivery OTPs before creating a new one', async () => {
      await ctx.service.requestDeliveryOtp('order-1', '+15555555555', 'user-1');

      expect(ctx.otpRepo.update).toHaveBeenCalledWith(
        { orderId: 'order-1', type: OtpType.DELIVERY_CONFIRMATION, status: OtpStatus.PENDING },
        { status: OtpStatus.EXPIRED },
      );
      expect(ctx.otpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          userId: 'user-1',
          type: OtpType.DELIVERY_CONFIRMATION,
          status: OtpStatus.PENDING,
        }),
      );
    });

    it('sends OTP via SMS when a recipient phone is provided', async () => {
      await ctx.service.requestDeliveryOtp('order-2', '+15555555555');

      expect(ctx.notificationService.sendSMS).toHaveBeenCalledWith(
        '+15555555555',
        expect.stringContaining('delivery OTP'),
      );
    });

    it('does not send SMS when no recipient phone is provided', async () => {
      await ctx.service.requestDeliveryOtp('order-3');

      expect(ctx.notificationService.sendSMS).not.toHaveBeenCalled();
    });
  });

  describe('verifyDeliveryOtp', () => {
    it('requires orderId and code', async () => {
      await expect(ctx.service.verifyDeliveryOtp('', '123456')).rejects.toThrow(BadRequestException);
      await expect(ctx.service.verifyDeliveryOtp('order-1', '')).rejects.toThrow(BadRequestException);
    });

    it('rejects when no pending delivery OTP exists', async () => {
      ctx.otpRepo.findOne.mockResolvedValue(null);

      await expect(ctx.service.verifyDeliveryOtp('order-1', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an expired delivery OTP', async () => {
      ctx.otpRepo.findOne.mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(ctx.service.verifyDeliveryOtp('order-1', '123456')).rejects.toThrow('expired');
      expect(ctx.otpRepo.update).toHaveBeenCalledWith('otp-1', { status: OtpStatus.EXPIRED });
    });

    it('rejects an incorrect delivery OTP', async () => {
      ctx.otpRepo.findOne.mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(ctx.service.verifyDeliveryOtp('order-1', '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('verifies a valid delivery OTP and marks it as verified', async () => {
      ctx.otpRepo.findOne.mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        expiresAt: new Date(Date.now() + 60000),
      });

      const result = await ctx.service.verifyDeliveryOtp('order-1', '123456');

      expect(result).toEqual({ valid: true });
      expect(ctx.otpRepo.update).toHaveBeenCalledWith('otp-1', expect.objectContaining({ status: OtpStatus.VERIFIED }));
    });
  });
});
