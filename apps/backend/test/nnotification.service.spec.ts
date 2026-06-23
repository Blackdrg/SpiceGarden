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

    it('should return failure when FCM fetch throws without crashing critical flow', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return 'valid-fcm-key';
        return 'test-key';
      });
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([{ fcmToken: 'token-1' }]);
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as any;

      try {
        const result = await service.sendPush('user-1', 'title', 'body');
        expect(result.success).toBe(false);
        expect(result.error).toBe('network down');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should return no devices when no active devices', async () => {
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([]);
      const result = await service.sendPush('user-1', 'title', 'body');
      expect(result.reason).toBe('No active devices');
    });

    it('should succeed when FCM is configured and devices exist', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return 'valid-fcm-key';
        return 'test-key';
      });
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([{ fcmToken: 'token-1' }]);
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ messageId: 'msg-1' }) }) as any;

      try {
        const result = await service.sendPush('user-1', 'title', 'body', { orderId: 'o1' });
        expect(result.success).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
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

  describe('sendPush - success path', () => {
    it('should send push notification to all active devices', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return 'valid-fcm-key';
        return 'test-key';
      });
      const devices = [
        { fcmToken: 'token-1', userId: 'user-1', isActive: true },
        { fcmToken: 'token-2', userId: 'user-1', isActive: true },
        { fcmToken: '', userId: 'user-1', isActive: true },
      ];
      (userDeviceRepo.find as jest.Mock).mockResolvedValue(devices);
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ messageId: 'msg-1' }),
      }) as any;

      try {
        const result = await service.sendPush('user-1', 'Title', 'Body', { orderId: 'o1' });
        expect(result.success).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://fcm.googleapis.com/fcm/send',
          expect.objectContaining({ method: 'POST' })
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('sendSMS', () => {
    it('should return not configured when Twilio not configured', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'TWILIO_ACCOUNT_SID' || key === 'TWILIO_AUTH_TOKEN' || key === 'TWILIO_PHONE') return undefined;
        return 'test-key';
      });
      const result = await service.sendSMS('+1234567890', 'message');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Twilio not configured');
    });

    it('should return error when Twilio API returns non-ok', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'TWILIO_ACCOUNT_SID') return 'sid-123';
        if (key === 'TWILIO_AUTH_TOKEN') return 'token-123';
        if (key === 'TWILIO_PHONE') return '+15550000000';
        return 'test-key';
      });
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('Invalid phone number'),
      }) as any;

      try {
        const result = await service.sendSMS('+1234567890', 'message');
        expect(result.success).toBe(false);
      } finally {
        global.fetch = originalFetch;
      }
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

    it('should return error when SendGrid API fails', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'valid-sendgrid-key';
        return 'test-key';
      });
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('API error'),
      }) as any;

      try {
        const result = await service.sendEmail('test@test.com', 'subject', 'template', {});
        expect(result.success).toBe(false);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('notifyOrderUpdate', () => {
    it('should send push to user and SMS for delivered orders with phone', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return 'valid-fcm-key';
        return 'test-key';
      });
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([{ fcmToken: 'token-1', isActive: true }]);
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      }) as any;

      try {
        await service.notifyOrderUpdate('user-1', 'order-123', 'delivered', '+1234567890');
        expect(global.fetch).toHaveBeenCalledTimes(2);
        const calls = (global.fetch as jest.Mock).mock.calls;
        expect(calls[0][0]).toContain('fcm.googleapis.com');
        expect(calls[1][0]).toContain('twilio.com');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('sendAPNs', () => {
    it('should return not configured when APNs key has CHANGE_ME', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'APNS_PRIVATE_KEY') return 'CHANGE_ME';
        return 'test-key';
      });
      const result = await service.sendAPNs('user-1', 'Title', 'Body');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('APNs not configured');
    });

    it('should return not configured when APNs key missing required fields', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'APNS_PRIVATE_KEY') return 'key';
        if (key === 'APNS_KEY_ID') return undefined;
        return 'test-key';
      });
      const result = await service.sendAPNs('user-1', 'Title', 'Body');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('APNs not configured');
    });

    it('should return no active iOS devices when no APNs tokens', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'APNS_PRIVATE_KEY') return 'valid-key';
        if (key === 'APNS_KEY_ID') return 'key-id';
        if (key === 'APNS_TEAM_ID') return 'team-id';
        if (key === 'APNS_BUNDLE_ID') return 'bundle-id';
        return 'test-key';
      });
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([
        { fcmToken: 'fcm-1', isActive: true, apnsToken: undefined },
      ]);

      const result = await service.sendAPNs('user-1', 'Title', 'Body');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('No active iOS devices');
    });

    it('should send APNs notification to valid devices', async () => {
      (service as any).configService.get.mockImplementation((key: string) => {
        if (key === 'APNS_PRIVATE_KEY') return 'valid-key';
        if (key === 'APNS_KEY_ID') return 'key-id';
        if (key === 'APNS_TEAM_ID') return 'team-id';
        if (key === 'APNS_BUNDLE_ID') return 'bundle-id';
        if (key === 'APNS_ENVIRONMENT') return 'development';
        return 'test-key';
      });
      (userDeviceRepo.find as jest.Mock).mockResolvedValue([
        { id: 'd1', fcmToken: 'fcm-1', isActive: true, apnsToken: 'apns-token-1' },
      ]);
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      }) as any;

      try {
        const result = await service.sendAPNs('user-1', 'Title', 'Body', { orderId: 'o1' });
        expect(result.success).toBe(true);
        expect(result.sent).toBe(1);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});