import { Test, TestingModule } from '@nestjs/testing';
import { ProductionNotificationService } from '../src/services/notifications/production-notification.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../src/services/notifications/notification.service';

describe('ProductionNotificationService', () => {
  let service: ProductionNotificationService;
  let configService: jest.Mocked<ConfigService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const defaults: Record<string, any> = {
          NOTIFICATION_CHANNELS: { email: true, sms: false, push: true, webhook: false },
        };
        return defaults[key] ?? defaultValue;
      }),
    } as any;

    mockNotificationService = {
      sendPushNotification: jest.fn(),
      sendEmailNotification: jest.fn(),
      sendSMSNotification: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionNotificationService,
        { provide: ConfigService, useValue: configService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get(ProductionNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPaymentNotification', () => {
    it('should delegate to sendNotification', async () => {
      const sendSpy = jest.spyOn(service as any, 'sendNotification').mockResolvedValue(undefined);

      await service.sendPaymentNotification('user-1', 'pay-1', { type: 'payment_success', severity: 'low', message: 'OK' });

      expect(sendSpy).toHaveBeenCalled();
      sendSpy.mockRestore();
    });
  });

  describe('sendOrderNotification', () => {
    it('should delegate to sendNotification', async () => {
      const sendSpy = jest.spyOn(service as any, 'sendNotification').mockResolvedValue(undefined);

      await service.sendOrderNotification('user-1', 'ord-1', { type: 'order_cancelled', severity: 'medium', message: 'Cancelled' });

      expect(sendSpy).toHaveBeenCalled();
      sendSpy.mockRestore();
    });
  });

  describe('sendFraudAlert', () => {
    it('should set type to fraud_detected and delegate', async () => {
      const sendSpy = jest.spyOn(service as any, 'sendNotification').mockResolvedValue(undefined);

      await service.sendFraudAlert('user-1', { severity: 'high', message: 'Suspicious activity' });

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'fraud_detected', severity: 'high', userId: 'user-1' })
      );
      sendSpy.mockRestore();
    });
  });

  describe('sendWebhookAlert', () => {
    it('should delegate to sendNotification', async () => {
      const sendSpy = jest.spyOn(service as any, 'sendNotification').mockResolvedValue(undefined);

      await service.sendWebhookAlert('wh-1', 'Timeout error', { data: 1 });

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'webhook_failure', severity: 'high', userId: 'system' })
      );
      sendSpy.mockRestore();
    });
  });

  describe('sendNotification', () => {
    it('should send slack alert for critical severity when slack enabled', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'NOTIFICATION_CHANNELS') return { email: true, sms: true, push: true, webhook: false, slack: true };
        return defaultValue;
      });

      const slackSpy = jest.spyOn(service as any, 'sendSlackAlert').mockResolvedValue(undefined);
      const emailSpy = jest.spyOn(service as any, 'sendEmailNotification').mockResolvedValue(undefined);
      const smsSpy = jest.spyOn(service as any, 'sendSMSForAlert').mockResolvedValue(undefined);
      const pushSpy = jest.spyOn(service as any, 'sendPushNotification').mockResolvedValue(undefined);

      await (service as any).sendNotification({ type: 'payment_failure', severity: 'critical', userId: 'u1', message: 'Fail', paymentId: 'p1' });

      expect(slackSpy).toHaveBeenCalled();
      expect(emailSpy).toHaveBeenCalled();
      expect(smsSpy).toHaveBeenCalled();
      expect(pushSpy).toHaveBeenCalled();
      slackSpy.mockRestore();
      emailSpy.mockRestore();
      smsSpy.mockRestore();
      pushSpy.mockRestore();
    });

    it('should send slack alert for high severity when slack enabled', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'NOTIFICATION_CHANNELS') return { email: true, sms: false, push: true, webhook: false, slack: true };
        return defaultValue;
      });

      const slackSpy = jest.spyOn(service as any, 'sendSlackAlert').mockResolvedValue(undefined);

      await (service as any).sendNotification({ type: 'payment_failure', severity: 'high', userId: 'u1', message: 'Fail', paymentId: 'p1' });

      expect(slackSpy).toHaveBeenCalled();
      slackSpy.mockRestore();
    });

    it('should not send slack for low severity', async () => {
      const slackSpy = jest.spyOn(service as any, 'sendSlackAlert').mockResolvedValue(undefined);

      await (service as any).sendNotification({ type: 'payment_success', severity: 'low', userId: 'u1', message: 'OK', paymentId: 'p1' });

      expect(slackSpy).not.toHaveBeenCalled();
      slackSpy.mockRestore();
    });

    it('should skip email when email channel disabled', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'NOTIFICATION_CHANNELS') return { email: false, sms: false, push: true, webhook: false };
        return defaultValue;
      });

      const emailSpy = jest.spyOn(service as any, 'sendEmailNotification').mockResolvedValue(undefined);

      await (service as any).sendNotification({ type: 'payment_failure', severity: 'high', userId: 'u1', message: 'Fail', paymentId: 'p1' });

      expect(emailSpy).not.toHaveBeenCalled();
      emailSpy.mockRestore();
    });

    it('should only send SMS for critical severity when sms enabled', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'NOTIFICATION_CHANNELS') return { email: true, sms: true, push: true, webhook: false };
        return defaultValue;
      });

      const smsSpy = jest.spyOn(service as any, 'sendSMSForAlert').mockResolvedValue(undefined);

      await (service as any).sendNotification({ type: 'payment_failure', severity: 'high', userId: 'u1', message: 'Fail', paymentId: 'p1' });

      expect(smsSpy).not.toHaveBeenCalled();

      await (service as any).sendNotification({ type: 'order_cancelled', severity: 'critical', userId: 'u1', message: 'DB down' });

      expect(smsSpy).toHaveBeenCalled();
      smsSpy.mockRestore();
    });

    it('should skip push when push channel disabled', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'NOTIFICATION_CHANNELS') return { email: true, sms: false, push: false, webhook: false };
        return defaultValue;
      });

      const pushSpy = jest.spyOn(service as any, 'sendPushNotification').mockResolvedValue(undefined);

      await (service as any).sendNotification({ type: 'payment_failure', severity: 'high', userId: 'u1', message: 'Fail', paymentId: 'p1' });

      expect(pushSpy).not.toHaveBeenCalled();
      pushSpy.mockRestore();
    });
  });

  describe('sendWebhookAlertForNotification', () => {
    it('should return early when no webhook URL configured', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'ALERT_WEBHOOK_URL') return null;
        return defaultValue;
      });

      const result = await (service as any).sendWebhookAlertForNotification({ type: 'test', severity: 'low', userId: 'u1', message: 'test' });

      expect(result).toBeUndefined();
    });

    it('should post to webhook URL when configured', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true } as any);
      (global as any).fetch = mockFetch;
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'ALERT_WEBHOOK_URL') return 'http://localhost:4000/webhook';
        if (key === 'ALERT_WEBHOOK_SECRET') return 'secret123';
        return defaultValue;
      });

      await (service as any).sendWebhookAlertForNotification({ type: 'test', severity: 'low', userId: 'u1', message: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/webhook',
        expect.objectContaining({ method: 'POST' })
      );
      (global as any).fetch = undefined;
    });
  });

  describe('sendSlackAlert', () => {
    it('should return early when no Slack webhook configured', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SLACK_WEBHOOK_URL') return null;
        return defaultValue;
      });

      const result = await (service as any).sendSlackAlert({ type: 'test', severity: 'low', userId: 'u1', message: 'test' });

      expect(result).toBeUndefined();
    });
  });

  describe('sendEmailNotification', () => {
    it('should return early when SendGrid not configured', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SENDGRID_API_KEY') return null;
        if (key === 'ADMIN_ALERT_EMAIL') return 'admin@test.com';
        return defaultValue;
      });

      const result = await (service as any).sendEmailNotification({ type: 'test', severity: 'low', userId: 'u1', message: 'test' });

      expect(result).toBeUndefined();
    });
  });

  describe('sendSMSForAlert', () => {
    it('should return early when Twilio not configured', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'TWILIO_ACCOUNT_SID') return null;
        return defaultValue;
      });

      const result = await (service as any).sendSMSForAlert({ type: 'test', severity: 'critical', userId: 'u1', message: 'test' });

      expect(result).toBeUndefined();
    });
  });
});
