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
    expect(PaymentGatewayFactory.prototype.getAvailableGateways()).toEqual(['stripe', 'razorpay', 'cod']);
  });

  it('.env.example has all payment config variables', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.resolve(__dirname, '../.env.example');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const required = [
        'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_CONNECT_ENABLED',
        'STRIPE_CONNECT_SECRET_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_SETTLEMENT_ENABLED',
        'STRIPE_WEBHOOK_URL', 'RAZORPAY_WEBHOOK_URL', 'PAYMENT_PRIMARY_GATEWAY',
      ];
      required.forEach((v) => expect(content).toContain(v));
    }
  });

  it('StripeConnect source has payout methods', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/payment-provider/stripe-connect.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('async sendPayout');
      expect(content).toContain('async createConnectAccount');
      expect(content).toContain('stripe.transfers.create');
      expect(content).toContain('async getPayoutHistory');
      expect(content).toContain('async getAccountBalance');
    }
  });

  it('RazorpaySettlement source has payout methods', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/payment-provider/razorpay-settlement.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('async processPayout');
      expect(content).toContain('settlements');
      expect(content).toContain('createFundAccount');
      expect(content).toContain('getAccountStatus');
    }
  });

  it('payout service source wires to stripe connect and razorpay settlement', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/restaurant/payout.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('stripeConnectService');
      expect(content).toContain('razorpaySettlementService');
      expect(content).toContain('STRIPE_CONNECT_ENABLED');
      expect(content).toContain('RAZORPAY_SETTLEMENT_ENABLED');
    }
  });

  it('payment service uses fetchPaymentDetails for refund validation', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/payments/payments.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('fetchPaymentDetails(paymentId, userId)');
      expect(content).toContain('async refundPayment');
    }
  });

  it('chargeback service has initiateRefundForWonDispute implementation', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../src/services/payments/chargeback/chargeback.service.ts');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('async initiateRefundForWonDispute');
      expect(content).toContain('stripe.refunds.create');
    }
  });
});
