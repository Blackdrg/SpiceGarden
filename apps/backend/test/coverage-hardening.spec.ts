import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ProductionAPNsProvider } from '../src/services/notifications/production-apns.provider';
import { ProductionFCMProvider } from '../src/services/notifications/production-fcm.provider';
import { ProductionMapsService } from '../src/services/maps/production-maps.service';
import { CashOnDeliveryGateway } from '../src/services/payments/gateways/cod-gateway.service';
import { RazorpayGateway } from '../src/services/payments/gateways/razorpay-gateway.service';

describe('Coverage Hardening: Push Providers, Maps & Gateways', () => {
  let apnsProvider: ProductionAPNsProvider;
  let fcmProvider: ProductionFCMProvider;
  let mapsService: ProductionMapsService;
  let codGateway: CashOnDeliveryGateway;
  let razorpayGateway: RazorpayGateway;
  let configService: ConfigService;

  beforeEach(async () => {
    const configMap: Record<string, string> = {
      APNS_KEY_ID: 'TEST_KEY_ID',
      APNS_TEAM_ID: 'TEST_TEAM_ID',
      APNS_TOPIC: 'com.spicegarden.app',
      FCM_SERVER_KEY: 'TEST_FCM_KEY',
      GOOGLE_MAPS_API_KEY: 'TEST_MAPS_KEY',
      RAZORPAY_KEY_ID: 'rzp_test_123',
      RAZORPAY_KEY_SECRET: 'rzp_secret_123',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionAPNsProvider,
        ProductionFCMProvider,
        ProductionMapsService,
        CashOnDeliveryGateway,
        RazorpayGateway,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configMap[key]),
          },
        },
      ],
    }).compile();

    apnsProvider = module.get<ProductionAPNsProvider>(ProductionAPNsProvider);
    fcmProvider = module.get<ProductionFCMProvider>(ProductionFCMProvider);
    mapsService = module.get<ProductionMapsService>(ProductionMapsService);
    codGateway = module.get<CashOnDeliveryGateway>(CashOnDeliveryGateway);
    razorpayGateway = module.get<RazorpayGateway>(RazorpayGateway);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('ProductionAPNsProvider', () => {
    it('returns success for empty device tokens', async () => {
      const res = await apnsProvider.sendPush({
        deviceTokens: [],
        title: 'Hello',
        body: 'World',
      });
      expect(res.success).toBe(true);
      expect(res.sentCount).toBe(0);
    });

    it('filters out invalid tokens not 64 chars', async () => {
      const res = await apnsProvider.sendPush({
        deviceTokens: ['short', ''],
        title: 'Hello',
        body: 'World',
      });
      expect(res.sentCount).toBe(0);
    });

    it('handles sandbox mode when keys are missing or CHANGE_ME', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce('CHANGE_ME' as any);
      const valid64Token = 'a'.repeat(64);
      const res = await apnsProvider.sendPush({
        deviceTokens: [valid64Token],
        title: 'Order Updated',
        body: 'Your food is on the way',
        badge: 2,
        sound: 'alert.wav',
        data: { orderId: '123' },
      });
      expect(res.success).toBe(true);
      expect(res.sentCount).toBe(1);
      expect(res.apnsIds[0]).toContain('apns_mock_');
    });

    it('sends push with live payload when keys are valid', async () => {
      const valid64Token1 = 'a'.repeat(64);
      const valid64Token2 = 'b'.repeat(64);
      const res = await apnsProvider.sendPush({
        deviceTokens: [valid64Token1, valid64Token2],
        title: 'Order Delivered',
        body: 'Enjoy your meal',
        topic: 'com.spicegarden.customer',
      });
      expect(res.success).toBe(true);
      expect(res.sentCount).toBe(2);
      expect(res.apnsIds.length).toBe(2);
    });
  });

  describe('ProductionFCMProvider', () => {
    it('returns success for empty tokens', async () => {
      const res = await fcmProvider.sendMulticast({
        tokens: [],
        title: 'Test',
        body: 'Test body',
      });
      expect(res.success).toBe(true);
      expect(res.successCount).toBe(0);
    });

    it('filters invalid tokens <= 10 chars', async () => {
      const res = await fcmProvider.sendMulticast({
        tokens: ['abc', ''],
        title: 'Test',
        body: 'Test body',
      });
      expect(res.successCount).toBe(0);
    });

    it('handles sandbox mode when key is missing or CHANGE_ME', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce('CHANGE_ME' as any);
      const res = await fcmProvider.sendMulticast({
        tokens: ['valid_fcm_token_1234567890'],
        title: 'Sandbox Alert',
        body: 'Sandbox body',
      });
      expect(res.success).toBe(true);
      expect(res.successCount).toBe(1);
    });

    it('handles live multicast push with fetch mock', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: 1,
          failure: 1,
          results: [
            { message_id: 'msg_1' },
            { error: 'NotRegistered' },
          ],
        }),
      });
      global.fetch = mockFetch as any;

      const res = await fcmProvider.sendMulticast({
        tokens: ['token_12345678901', 'token_12345678902'],
        title: 'Special Offer',
        body: '50% off on curries',
        priority: 'high',
        ttlSeconds: 1800,
        data: { promo: 'CURRY50' },
      });

      expect(res.success).toBe(true);
      expect(res.successCount).toBe(1);
      expect(res.failureCount).toBe(1);
      expect(res.invalidTokens).toContain('token_12345678902');
      expect(res.messageIds).toContain('msg_1');
    });

    it('handles fetch exception gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network offline')) as any;

      const res = await fcmProvider.sendMulticast({
        tokens: ['token_12345678901'],
        title: 'Fail test',
        body: 'Fail body',
      });

      expect(res.success).toBe(false);
      expect(res.failureCount).toBe(1);
    });
  });

  describe('ProductionMapsService', () => {
    it('calculates distance and route using coordinates', async () => {
      const origin = { lat: 12.9716, lng: 77.5946 };
      const dest = { lat: 12.9352, lng: 77.6245 };

      const result = mapsService.calculateDistance(origin, dest);
      expect(result).toBeDefined();
      expect(result.distanceMeters).toBeGreaterThan(0);
      expect(result.durationMinutes).toBeGreaterThan(0);

      const route = await mapsService.calculateRoute(origin, dest);
      expect(route.distanceMeters).toBeGreaterThan(0);
      expect(route.steps.length).toBeGreaterThan(0);
    });

    it('handles geocoding and reverse geocoding fallbacks', async () => {
      const coords = await mapsService.geocode('MG Road, Bangalore');
      expect(coords).toBeDefined();
      expect(coords.lat).toBeDefined();

      const addr = await mapsService.reverseGeocode({ lat: 12.9716, lng: 77.5946 });
      expect(addr).toBeDefined();
      expect(addr.formattedAddress).toBeDefined();

      const metrics = mapsService.getCostMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });

    it('validates and ingests driver location telemetry', async () => {
      const val = mapsService.validateCoordinates({ lat: 12.9716, lng: 77.5946 });
      expect(val.isValid).toBe(true);

      const invalid = mapsService.validateCoordinates({ lat: NaN, lng: 77.5946 });
      expect(invalid.isValid).toBe(false);

      const res = await mapsService.ingestDriverLocation({
        driverId: 'driver_001',
        tenantId: 'tenant_1',
        coordinate: { lat: 12.9716, lng: 77.5946 },
        timestamp: Date.now(),
      });
      expect(res.accepted).toBe(true);
      expect(mapsService.getDriverLocation('driver_001')).toBeDefined();
    });
  });

  describe('Payment Gateways Coverage', () => {
    it('COD gateway processes and verifies order correctly', async () => {
      const intent = await codGateway.createPaymentIntent(500, 'INR', 'user_123', { orderId: 'ord_123' });
      expect(intent.status).toBe('pending');
      expect(intent.payment_method).toBe('cod');

      const details = await codGateway.fetchPaymentDetails(intent.id);
      expect(details.id).toBe(intent.id);

      const confirmed = await codGateway.confirmPayment(intent.id, 'user_123');
      expect(confirmed.status).toBe('pending');

      const refund = await codGateway.refundPayment(intent.id, 500, 'user_123', 'order_cancelled');
      expect(refund.status).toBe('processed');

      const event = await codGateway.constructEvent(Buffer.from('{}'), 'sig', 'secret');
      expect(event).toBeDefined();
      expect(codGateway.getGatewayName()).toBe('cod');
    });

    it('Razorpay gateway creates intent and verifies webhook signatures', async () => {
      expect(razorpayGateway.getGatewayName()).toBe('razorpay');

      const payload = JSON.stringify({ event: 'payment.captured', entity: { id: 'pay_123' } });
      const secret = 'rzp_secret_123';
      const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const event = await razorpayGateway.constructEvent(payload, sig, secret);
      expect(event.data.object).toBeDefined();

      await expect(razorpayGateway.constructEvent(payload, 'wrong_sig', secret)).rejects.toThrow();
    });
  });
});
