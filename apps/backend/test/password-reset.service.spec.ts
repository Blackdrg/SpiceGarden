import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PasswordResetService } from '../src/services/auth/password-reset.service';
import { UserEntity } from '../src/db/entities/user.entity';
import { OtpEntity, OtpType, OtpStatus } from '../src/db/entities/otp.entity';
import { AuthService } from '../src/services/auth/auth.service';
import { NotificationService } from '../src/services/notifications/notification.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let userRepo: any;
  let otpRepo: any;
  let configService: any;
  let authService: any;
  let notificationService: any;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    otpRepo = {
      save: jest.fn().mockResolvedValue({ id: 'otp-1' }),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    configService = {
      get: jest.fn(),
    };

    authService = {
      hashPassword: jest.fn().mockResolvedValue('hashed_password_123'),
    };

    notificationService = {
      sendEmail: jest.fn().mockResolvedValue(true),
      sendSMS: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(OtpEntity), useValue: otpRepo },
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP string', async () => {
      const otp = await service.generateOTP();
      expect(otp).toBeDefined();
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });
  });

  describe('sendOTPByEmail', () => {
    it('should return early if email or otp is missing', async () => {
      await service.sendOTPByEmail('', '123456');
      await service.sendOTPByEmail('test@example.com', '');
      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });

    it('should fallback to notificationService when SENDGRID_API_KEY is missing or placeholder', async () => {
      configService.get.mockReturnValue('CHANGE_ME');
      await service.sendOTPByEmail('test@example.com', '123456');
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Password Reset Code',
        'd-reset-template',
        { code: '123456', expiry: '5 minutes' }
      );
    });

    it('should send email using fetch when valid SendGrid API key exists', async () => {
      configService.get.mockReturnValue('SG.valid_key_12345');
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('ok'),
      } as any);

      await service.sendOTPByEmail('test@example.com', '654321');
      expect(global.fetch).toHaveBeenCalled();

      global.fetch = originalFetch;
    });

    it('should throw error when SendGrid request fails', async () => {
      configService.get.mockReturnValue('SG.valid_key_12345');
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('API rate limit exceeded'),
      } as any);

      await expect(service.sendOTPByEmail('test@example.com', '654321')).rejects.toThrow(
        'Failed to send email: API rate limit exceeded'
      );

      global.fetch = originalFetch;
    });
  });

  describe('sendOTPBySMS', () => {
    it('should call notificationService.sendSMS', async () => {
      await service.sendOTPBySMS('+1234567890', '123456');
      expect(notificationService.sendSMS).toHaveBeenCalledWith(
        '+1234567890',
        'Your SpiceGarden password reset code is: 123456. Valid for 5 minutes.'
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return silently if user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.forgotPassword('nonexistent@example.com')).resolves.toBeUndefined();
      expect(otpRepo.save).not.toHaveBeenCalled();
    });

    it('should generate OTP and send via SMS if user has phone', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com', phone: '+1234567890' });
      await service.forgotPassword('test@example.com');

      expect(otpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: OtpType.PASSWORD_RESET,
          status: OtpStatus.PENDING,
        })
      );
      expect(notificationService.sendSMS).toHaveBeenCalled();
    });

    it('should generate OTP and send via Email if user has no phone', async () => {
      configService.get.mockReturnValue(undefined);
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com', phone: null });
      await service.forgotPassword('test@example.com');

      expect(otpRepo.save).toHaveBeenCalled();
      expect(notificationService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('verifyResetCode', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyResetCode('notfound@example.com', '123456')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if no pending OTP found', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue(null);

      await expect(service.verifyResetCode('test@example.com', '123456')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if code does not match', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue({ id: 'otp-1', code: '999999', expiresAt: new Date(Date.now() + 60000) });

      await expect(service.verifyResetCode('test@example.com', '123456')).rejects.toThrow(
        'Invalid reset code'
      );
    });

    it('should mark OTP as EXPIRED and throw UnauthorizedException if code has expired', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        expiresAt: new Date(Date.now() - 10000),
      });

      await expect(service.verifyResetCode('test@example.com', '123456')).rejects.toThrow(
        'Reset code has expired'
      );
      expect(otpRepo.update).toHaveBeenCalledWith('otp-1', { status: OtpStatus.EXPIRED });
    });

    it('should update OTP status to VERIFIED and return true on success', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        expiresAt: new Date(Date.now() + 60000),
      });

      const result = await service.verifyResetCode('test@example.com', '123456');
      expect(result).toBe(true);
      expect(otpRepo.update).toHaveBeenCalledWith('otp-1', expect.objectContaining({ status: OtpStatus.VERIFIED }));
    });
  });

  describe('resetPassword', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.resetPassword('notfound@example.com', '123456', 'newPass123!')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw UnauthorizedException if no verified OTP found', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('test@example.com', '123456', 'newPass123!')).rejects.toThrow(
        'Invalid or expired reset code'
      );
    });

    it('should throw UnauthorizedException if OTP code mismatch', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue({ id: 'otp-1', code: '999999' });

      await expect(service.resetPassword('test@example.com', '123456', 'newPass123!')).rejects.toThrow(
        'Invalid reset code'
      );
    });

    it('should hash new password, update user and update otp on success', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      otpRepo.findOne.mockResolvedValue({ id: 'otp-1', code: '123456' });

      await service.resetPassword('test@example.com', '123456', 'newPassword@123');

      expect(authService.hashPassword).toHaveBeenCalledWith('newPassword@123');
      expect(userRepo.update).toHaveBeenCalledWith('user-1', { passwordHash: 'hashed_password_123' });
      expect(otpRepo.update).toHaveBeenCalledWith('otp-1', { status: OtpStatus.VERIFIED });
    });
  });
});
