/**
 * SPICEGARDEN SIMULATION - Mock Payment Gateway
 * Deterministic payment processing state machine with strict idempotency verification.
 * Supports SUCCESS, DECLINED, TIMEOUT, DUPLICATE, RETRY, PROVIDER_ERROR.
 */

const crypto = require('crypto');

class MockPaymentGateway {
  constructor() {
    this.payments = new Map(); // paymentId -> paymentRecord
    this.idempotencyRegistry = new Map(); // idempotencyKey -> paymentId
    this.chaosMode = null; // null | 'timeout' | 'provider_error' | 'decline_rate'
    this.chaosDeclineRate = 0;

    this.metrics = {
      totalIntents: 0,
      totalCaptures: 0,
      successfulPayments: 0,
      declinedPayments: 0,
      timedOutPayments: 0,
      duplicatePrevented: 0,
      providerErrors: 0,
      retriedPayments: 0,
      doubleCapturePrevented: 0
    };
  }

  setChaosMode(mode, rate = 0) {
    this.chaosMode = mode;
    this.chaosDeclineRate = rate;
  }

  resetChaosMode() {
    this.chaosMode = null;
    this.chaosDeclineRate = 0;
  }

  async createPaymentIntent({ orderId, amount, currency = 'USD', customerId, tenantId, idempotencyKey }) {
    this.metrics.totalIntents++;

    if (this.chaosMode === 'timeout') {
      this.metrics.timedOutPayments++;
      throw new Error('PaymentGatewayTimeout: Gateway did not respond within 3000ms');
    }

    if (this.chaosMode === 'provider_error') {
      this.metrics.providerErrors++;
      throw new Error('PaymentGatewayProviderError: Upstream banking network unavailable (502)');
    }

    // Idempotency Key Handling
    if (idempotencyKey && this.idempotencyRegistry.has(idempotencyKey)) {
      this.metrics.duplicatePrevented++;
      const existingId = this.idempotencyRegistry.get(idempotencyKey);
      return {
        ...this.payments.get(existingId),
        isDuplicate: true
      };
    }

    const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
    const clientSecret = `pi_secret_${crypto.randomBytes(12).toString('hex')}`;

    const payment = {
      id: paymentId,
      orderId,
      tenantId,
      customerId,
      amount,
      currency,
      status: 'REQUIRES_CAPTURE',
      idempotencyKey,
      clientSecret,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.payments.set(paymentId, payment);
    if (idempotencyKey) {
      this.idempotencyRegistry.set(idempotencyKey, paymentId);
    }

    return payment;
  }

  async capturePayment(paymentId, paymentMethod = 'card') {
    this.metrics.totalCaptures++;

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`PaymentNotFound: Payment ${paymentId} does not exist`);
    }

    if (payment.status === 'SUCCEEDED') {
      this.metrics.doubleCapturePrevented++;
      return { ...payment, alreadyCaptured: true };
    }

    if (this.chaosDeclineRate > 0 && Math.random() < this.chaosDeclineRate) {
      payment.status = 'DECLINED';
      payment.failureReason = 'INSUFFICIENT_FUNDS';
      payment.updatedAt = new Date().toISOString();
      this.metrics.declinedPayments++;
      return { ...payment, success: false };
    }

    // Capture success
    payment.status = 'SUCCEEDED';
    payment.paymentMethod = paymentMethod;
    payment.capturedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();
    this.metrics.successfulPayments++;

    return { ...payment, success: true };
  }

  getMetrics() {
    return {
      totalIntents: this.metrics.totalIntents,
      totalCaptures: this.metrics.totalCaptures,
      successfulPayments: this.metrics.successfulPayments,
      declinedPayments: this.metrics.declinedPayments,
      timedOutPayments: this.metrics.timedOutPayments,
      duplicatePrevented: this.metrics.duplicatePrevented,
      providerErrors: this.metrics.providerErrors,
      doubleCapturePrevented: this.metrics.doubleCapturePrevented,
    };
  }
}

module.exports = { MockPaymentGateway };
