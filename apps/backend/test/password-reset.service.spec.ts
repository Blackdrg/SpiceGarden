import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetService } from '../src/services/auth/password-reset.service';
import { UserEntity } from '../src/db/entities/user.entity';
import { OtpEntity, OtpType, OtpStatus } from '../src/db/entities/otp.entity';
import { AuthService } from '../src/services/auth/auth.service';
import { NotificationService } from '../src/services/notifications/notification.service';
import { ConfigService } from '@nestjs/config';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let userRepo: Repository<UserEntity>;
  let otpRepo: Repository<OtpEntity>;
  let authService: AuthService;
  let notificationService: NotificationService;

  const user = { id: 'user-1', email: 'a@b.com', phone: '+919999999999', passwordHash: 'old' } as UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('CHANGE_ME') } },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOne: jest.fn(), update: jest.fn() },
        },
        {
          provide: getRepositoryToken(OtpEntity),
          useValue: { findOne: jest.fn(), save: jest.fn(), update: jest.fn() },
        },
        { provide: AuthService, useValue: { hashPassword: jest.fn().mockResolvedValue('hashed') } },
        {
          provide: NotificationService,
          useValue: { sendEmail: jest.fn().mockResolvedValue(undefined), sendSMS: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    otpRepo = module.get<Repository<OtpEntity>>(getRepositoryToken(OtpEntity));
    authService = module.get<AuthService>(AuthService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('generateOTP returns a 6 digit numeric code', async () => {
    const otp = await service.generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('sendOTPByEmail returns early when email or otp missing', async () => {
    await service.sendOTPByEmail('', '123456');
    await service.sendOTPByEmail('a@b.com', '');
    expect(notificationService.sendEmail).not.toHaveBeenCalled();
  });

  it('sendOTPByEmail uses notification service when sendgrid key is placeholder', async () => {
    await service.sendOTPByEmail('a@b.com', '123456');
    expect(notificationService.sendEmail).toHaveBeenCalledWith(
      'a@b.com',
      'Password Reset Code',
      'd-reset-template',
      expect.objectContaining({ code: '123456' }),
    );
  });

  it('sendOTPBySMS delegates to notification service', async () => {
    await service.sendOTPBySMS('+919999999999', '123456');
    expect(notificationService.sendSMS).toHaveBeenCalledWith(
      '+919999999999',
      expect.stringContaining('123456'),
    );
  });

  it('forgotPassword returns early when user not found', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    await service.forgotPassword('missing@b.com');
    expect(otpRepo.save).not.toHaveBeenCalled();
  });

  it('forgotPassword sends SMS when user has a phone', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    await service.forgotPassword(user.email);
    expect(notificationService.sendSMS).toHaveBeenCalled();
    expect(notificationService.sendEmail).not.toHaveBeenCalled();
  });

  it('forgotPassword sends email when user has no phone', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue({ ...user, phone: undefined } as UserEntity);
    await service.forgotPassword(user.email);
    expect(notificationService.sendEmail).toHaveBeenCalled();
    expect(notificationService.sendSMS).not.toHaveBeenCalled();
  });

  it('verifyResetCode throws NotFoundException when user missing', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    await expect(service.verifyResetCode('missing@b.com', '123456')).rejects.toThrow();
  });

  it('verifyResetCode throws when no pending otp', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue(null);
    await expect(service.verifyResetCode(user.email, '123456')).rejects.toThrow();
  });

  it('verifyResetCode throws on code mismatch', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue({
      id: 'otp-1', code: '654321', expiresAt: new Date(Date.now() + 60000),
    } as OtpEntity);
    await expect(service.verifyResetCode(user.email, '123456')).rejects.toThrow();
  });

  it('verifyResetCode marks expired and throws when past expiry', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue({
      id: 'otp-1', code: '123456', expiresAt: new Date(Date.now() - 60000),
    } as OtpEntity);
    await expect(service.verifyResetCode(user.email, '123456')).rejects.toThrow();
    expect(otpRepo.update).toHaveBeenCalledWith('otp-1', { status: OtpStatus.EXPIRED });
  });

  it('verifyResetCode returns true for valid pending otp', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue({
      id: 'otp-1', code: '123456', expiresAt: new Date(Date.now() + 60000),
    } as OtpEntity);
    const result = await service.verifyResetCode(user.email, '123456');
    expect(result).toBe(true);
    expect(otpRepo.update).toHaveBeenCalledWith('otp-1', { status: OtpStatus.VERIFIED, verifiedAt: expect.any(Date) });
  });

  it('resetPassword throws NotFoundException when user missing', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    await expect(service.resetPassword('missing@b.com', '123456', 'newpass1')).rejects.toThrow();
  });

  it('resetPassword throws when no verified otp', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue(null);
    await expect(service.resetPassword(user.email, '123456', 'newpass1')).rejects.toThrow();
  });

  it('resetPassword throws on code mismatch', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue({
      id: 'otp-1', code: '654321',
    } as OtpEntity);
    await expect(service.resetPassword(user.email, '123456', 'newpass1')).rejects.toThrow();
  });

  it('resetPassword updates password hash for valid verified otp', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(otpRepo, 'findOne').mockResolvedValue({
      id: 'otp-1', code: '123456',
    } as OtpEntity);
    await service.resetPassword(user.email, '123456', 'newpass1');
    expect(authService.hashPassword).toHaveBeenCalledWith('newpass1');
    expect(userRepo.update).toHaveBeenCalledWith(user.id, { passwordHash: 'hashed' });
  });
});
