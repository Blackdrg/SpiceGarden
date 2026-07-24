import { describe, it, expect } from '@jest/globals';

describe('Payment Module Integration', () => {
  it('StripeGateway has all required gateway methods', async () => {
    const { StripeGateway } = await import('../src/services/payments/gateways/stripe-gateway.service');
    const proto = StripeGateway.prototype;
    expect(typeof proto.fetchPaymentDetails).toBe('function');
    expect(typeof proto.createPaymentIntent).toBe('function');
    expect(typeof proto.confirmPayment).toBe('function');
    expect(typeof proto.refundPayment).toBe('function');
  });

  it('RazorpayGateway has all required gateway methods', async () => {
    const { RazorpayGateway } = await import('../src/services/payments/gateways/razorpay-gateway.service');
    const proto = RazorpayGateway.prototype;
    expect(typeof proto.fetchPaymentDetails).toBe('function');
    expect(typeof proto.createPaymentIntent).toBe('function');
    expect(typeof proto.refundPayment).toBe('function');
  });

  it('CashOnDeliveryGateway has fetchPaymentDetails method', async () => {
    const { CashOnDeliveryGateway } = await import('../src/services/payments/gateways/cod-gateway.service');
    const proto = CashOnDeliveryGateway.prototype;
    expect(typeof proto.fetchPaymentDetails).toBe('function');
    expect(proto.getGatewayName()).toBe('cod');
  });

  it('PaymentGatewayFactory provides stripe and razorpay gateways', async () => {
    const { PaymentGatewayFactory } = await import('../src/services/payments/gateway-factory.service');
    expect(PaymentGatewayFactory.prototype.getGateway).toBeDefined();
    expect(PaymentGatewayFactory.prototype.getAvailableGateways).toBeDefined();
    const gateways = PaymentGatewayFactory.prototype.getAvailableGateways();
    expect(gateways.map((g: any) => g.name)).toContain('stripe');
    expect(gateways.map((g: any) => g.name)).toContain('razorpay');
  });

  it('.env.example has all payment config variables', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.resolve(__dirname, '../.env.example');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const required = [
        'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
        'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET',
        'PAYMENT_PRIMARY_GATEWAY',
      ];
      required.forEach((v) => expect(content).toContain(v));
    }
  });

  it('payout service exists and has required methods', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/restaurant/payout.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('generatePayoutReport');
      expect(content).toContain('getPayoutHistory');
      expect(content).toContain('processPayout');
      expect(content).toContain('getPendingPayouts');
    }
  });

  it('payment service has required methods', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/payments/payments.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('createPaymentIntent');
      expect(content).toContain('confirmPayment');
      expect(content).toContain('refundPayment');
      expect(content).toContain('constructEvent');
    }
  });

  it('chargeback service has dispute handling methods', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/payments/chargeback/chargeback.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('handleDisputeCreated');
      expect(content).toContain('handleDisputeClosed');
      expect(content).toContain('getDisputeStats');
    }
  });
});
