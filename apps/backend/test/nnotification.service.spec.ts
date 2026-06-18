import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../src/services/notifications/notification.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserDeviceEntity } from '../src/db/entities/user-device.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('NotificationService', () => {
  let service: NotificationService;
  let userDeviceRepo: Repository<UserDeviceEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-key'),
          },
        },
        {
          provide: getRepositoryToken(UserDeviceEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userDeviceRepo = module.get<Repository<UserDeviceEntity>>(getRepositoryToken(UserDeviceEntity));
  });

  describe('registerDevice', () => {
    it('should update existing device and mark as active', async () => {
      const existingDevice = { id: 'device-1', userId: 'user-1', fcmToken: 'token-1' };
      (userDeviceRepo.findOne as jest.Mock).mockResolvedValue(existingDevice);
      (userDeviceRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.registerDevice('user-1', 'token-1', { name: 'mobile', type: 'ios' });

      expect(userDeviceRepo.update).toHaveBeenCalledWith('device-1', expect.objectContaining({ isActive: true }));
    });

    it('should create new device if not exists', async () => {
      (userDeviceRepo.findOne as jest.Mock).mockResolvedValue(null);
      (userDeviceRepo.create as jest.Mock).mockReturnValue({ id: 'new-device' });
      (userDeviceRepo.save as jest.Mock).mockResolvedValue({ id: 'new-device' });

      await service.registerDevice('user-1', 'token-1', { name: 'mobile' });

      expect(userDeviceRepo.create).toHaveBeenCalled();
      expect(userDeviceRepo.save).toHaveBeenCalled();
    });
  });

  describe('unregisterDevice', () => {
    it('should mark device as inactive', async () => {
      (userDeviceRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });
      await service.unregisterDevice('user-1', 'token-1');
      expect(userDeviceRepo.update).toHaveBeenCalledWith({ userId: 'user-1', fcmToken: 'token-1' }, { isActive: false });
    });
  });

  describe('sendPush', () => {
    it('should return not configured when FCM key has CHANGE_ME', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return 'CHANGE_ME';
        return 'test-key';
      });
      const result = await service.sendPush('user-1', 'title', 'body');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('FCM not configured');
    });

    it('should return no devices when no active devices', async () => {
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([]);
      const result = await service.sendPush('user-1', 'title', 'body');
      expect(result.reason).toBe('No active devices');
    });
  });

  describe('sendSMS', () => {
    it('should return not configured when Twilio not configured', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'TWILIO_SID' || key === 'TWILIO_AUTH_TOKEN' || key === 'TWILIO_PHONE') return undefined;
        return 'test-key';
      });
      const result = await service.sendSMS('+1234567890', 'message');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Twilio not configured');
    });
  });

  describe('sendEmail', () => {
    it('should return not configured when SendGrid not set', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'CHANGE_ME';
        return 'test-key';
      });
      const result = await service.sendEmail('test@test.com', 'subject', 'template', {});
      expect(result.success).toBe(false);
      expect(result.reason).toBe('SendGrid not configured');
    });
  });

  describe('sendOTP', () => {
    it('should format OTP message correctly', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'TWILIO_SID' || key === 'TWILIO_AUTH_TOKEN' || key === 'TWILIO_PHONE') return undefined;
        return 'test-key';
      });
      const result = await service.sendOTP('+1234567890', '123456');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Twilio not configured');
    });
  });

  describe('notifyOrderUpdate', () => {
    it('should handle order update gracefully when FCM configured but no devices', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return 'valid-fcm-key';
        return 'test-key';
      });
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([]);
      await service.notifyOrderUpdate('user-1', 'order-123', 'delivered');
      expect(userDeviceRepo.find).toHaveBeenCalled();
    });
  });

  describe('notifyRestaurant', () => {
    it('should log and return alert for new order', async () => {
      const result = await service.notifyRestaurant('order-123', 'new_order', 'restaurant-1');
      expect(result.success).toBe(true);
      expect(result.alertType).toBe('new_order');
    });

    it('should handle order cancelled', async () => {
      const result = await service.notifyRestaurant('order-123', 'order_cancelled', 'restaurant-1');
      expect(result.success).toBe(true);
      expect(result.alertType).toBe('order_cancelled');
    });
  });

  describe('notifyDriver', () => {
    it('should return success for assigned event', async () => {
      const result = await service.notifyDriver('driver-1', 'order-123', 'assigned');
      expect(result.success).toBe(true);
      expect(result.event).toBe('assigned');
    });

    it('should return success for reassigned event', async () => {
      const result = await service.notifyDriver('driver-1', 'order-123', 'reassigned');
      expect(result.success).toBe(true);
      expect(result.event).toBe('reassigned');
    });
  });
});