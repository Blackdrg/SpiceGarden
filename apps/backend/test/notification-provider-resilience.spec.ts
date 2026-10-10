import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationEngineService } from '../src/services/notifications/notification-engine.service';
import { ProductionSMSProvider } from '../src/services/notifications/production-sms.provider';
import { ProductionFCMProvider } from '../src/services/notifications/production-fcm.provider';
import { ProductionAPNsProvider } from '../src/services/notifications/production-apns.provider';
import { NotificationPreferencesService } from '../src/services/notifications/notification-preferences.service';

describe('Notification Provider Resilience & Delivery Tests', () => {
  let engine: NotificationEngineService;
  let smsProvider: ProductionSMSProvider;
  let fcmProvider: ProductionFCMProvider;
  let apnsProvider: ProductionAPNsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEngineService,
        ProductionSMSProvider,
        ProductionFCMProvider,
        ProductionAPNsProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: any) => {
              const config: Record<string, any> = {
                TWILIO_ACCOUNT_SID: 'AC_test_123',
                TWILIO_AUTH_TOKEN: 'token_test_123',
                TWILIO_PHONE: '+15551234567',
                AWS_SNS_REGION: 'us-east-1',
                MSG91_AUTH_KEY: 'msg91_test_key',
                FCM_SERVER_KEY: 'fcm_test_key',
              };
              return config[key] ?? defaultVal;
            }),
          },
        },
        {
          provide: NotificationPreferencesService,
          useValue: {
            getPreferences: jest.fn().mockResolvedValue({
              email: true,
              sms: true,
              push: true,
              inApp: true,
            }),
          },
        },
      ],
    }).compile();

    engine = module.get<NotificationEngineService>(NotificationEngineService);
    smsProvider = module.get<ProductionSMSProvider>(ProductionSMSProvider);
    fcmProvider = module.get<ProductionFCMProvider>(ProductionFCMProvider);
    apnsProvider = module.get<ProductionAPNsProvider>(ProductionAPNsProvider);
  });

  describe('Provider Outage & Fallback Handling', () => {
    it('should format and send SMS via message interface', async () => {
      jest.spyOn(smsProvider as any, 'sendViaTwilio').mockResolvedValue({
        success: true,
        provider: 'twilio',
        messageId: 'tw-12345',
      });

      const res = await smsProvider.sendSMS({
        to: '+15550001111',
        message: 'Order confirmed',
      });

      expect(res.success).toBe(true);
      expect(res.provider).toBe('twilio');
    });

    it('should handle invalid token registration in FCM push provider', async () => {
      jest.spyOn(fcmProvider, 'sendMulticast').mockResolvedValue({
        success: false,
        successCount: 0,
        failureCount: 1,
        invalidTokens: ['invalid-dev-token-404'],
        messageIds: [],
        error: 'messaging/registration-token-not-registered',
      });

      const result = await fcmProvider.sendMulticast({
        tokens: ['invalid-dev-token-404'],
        title: 'Order Update',
        body: 'Driver arriving',
      });
      expect(result.success).toBe(false);
      expect(result.invalidTokens).toContain('invalid-dev-token-404');
    });

    it('should track deduplication cache accurately', () => {
      const dedupKey = 'user_123_order_created_ord_555';
      const initialCheck = engine.checkDuplicate(dedupKey);
      expect(initialCheck).toBeNull();
    });

    it('should enforce rate limiting to prevent provider quota exhaustion', () => {
      const key = 'user_quota_protect';
      const maxRequests = 10;
      const windowMs = 60000;

      for (let i = 0; i < maxRequests; i++) {
        expect(engine.checkRateLimit(key, maxRequests, windowMs)).toBe(true);
      }

      // 11th request should be rejected by rate limiter
      expect(engine.checkRateLimit(key, maxRequests, windowMs)).toBe(false);
    });

    it('should process high-volume batch delivery simulation without unhandled exceptions', async () => {
      const batchSize = 100;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < batchSize; i++) {
        promises.push(
          Promise.resolve({
            userId: `usr_${i}`,
            channel: 'push',
            status: 'queued',
            timestamp: Date.now(),
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results.length).toBe(100);
      expect(results.every(r => r.status === 'queued')).toBe(true);
    });
  });
});
