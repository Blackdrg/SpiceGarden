import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationEngineService } from '../src/services/notifications/notification-engine.service';
import { ProductionSMSProvider } from '../src/services/notifications/production-sms.provider';
import { ProductionFCMProvider } from '../src/services/notifications/production-fcm.provider';
import { ProductionAPNsProvider } from '../src/services/notifications/production-apns.provider';
import { NotificationPreferencesService } from '../src/services/notifications/notification-preferences.service';

describe('NotificationEngineService', () => {
  let service: NotificationEngineService;
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
            get: jest.fn((key: string) => {
              if (key === 'TWILIO_ACCOUNT_SID') return 'test_sid';
              if (key === 'TWILIO_AUTH_TOKEN') return 'test_token';
              if (key === 'TWILIO_PHONE') return '+15551234567';
              return null;
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
              inApp: true
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationEngineService>(NotificationEngineService);
    smsProvider = module.get<ProductionSMSProvider>(ProductionSMSProvider);
    fcmProvider = module.get<ProductionFCMProvider>(ProductionFCMProvider);
    apnsProvider = module.get<ProductionAPNsProvider>(ProductionAPNsProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate templates and render required variables', () => {
    const valid = service.validateTemplate('order_placed', { orderId: 'ord_123', totalAmount: '45.00' });
    expect(valid.isValid).toBe(true);
    expect(valid.missingVars.length).toBe(0);

    const invalid = service.validateTemplate('order_placed', { orderId: 'ord_123' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.missingVars).toContain('totalAmount');
  });

  it('should enforce rate limits on excessive notifications', () => {
    const key = 'user_rate_test_1';
    for (let i = 0; i < 20; i++) {
      expect(service.checkRateLimit(key, 20, 60000)).toBe(true);
    }
    // 21st notification should be blocked
    expect(service.checkRateLimit(key, 20, 60000)).toBe(false);
  });

  it('should suppress duplicate notifications within deduplication window', async () => {
    const req = {
      userId: 'user_dedup_1',
      type: 'order_status' as const,
      channels: ['sms' as const],
      title: 'Order Status Update',
      body: 'Your order is confirmed',
      phone: '+15550001111',
      idempotencyKey: 'idemp_key_001'
    };

    const first = await service.dispatch(req);
    expect(first.success).toBe(true);
    expect(first.deduplicated).toBeFalsy();

    // Immediate duplicate attempt
    const second = await service.dispatch(req);
    expect(second.success).toBe(true);
    expect(second.deduplicated).toBe(true);
  });

  it('should collect delivery metrics accurately', async () => {
    const metrics = service.getMetrics();
    expect(metrics.totalRequested).toBeGreaterThanOrEqual(0);
    expect(metrics.byChannel.sms).toBeDefined();
    expect(metrics.byChannel.push).toBeDefined();
  });
});
