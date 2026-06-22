import { describe, expect, it, jest } from '@jest/globals';
import { CashOnDeliveryGateway } from '../src/services/payments/gateways/cod-gateway.service';

function createGateway() {
  return new CashOnDeliveryGateway() as any;
}

describe('CashOnDeliveryGateway', () => {
  it('returns gateway name', () => {
    const gateway = createGateway();
    expect(gateway.getGatewayName()).toBe('cod');
  });

  it('creates a pending COD payment intent with cod method', async () => {
    const gateway = createGateway();
    const result = await gateway.createPaymentIntent(150, 'inr', 'user-1', { orderId: 'ord-1' });

    expect(result.id).toMatch(/^cod_\d+_[a-z0-9]+$/);
    expect(result.amount).toBe(150);
    expect(result.currency).toBe('INR');
    expect(result.status).toBe('pending');
    expect(result.client_secret).toBe(result.id);
    expect(result.payment_method).toBe('cod');
    expect(result.metadata.paymentMethod).toBe('cash_on_delivery');
    expect(result.metadata.userId).toBe('user-1');
  });

  it('preserves metadata in the payment intent', async () => {
    const gateway = createGateway();
    const result = await gateway.createPaymentIntent(200, 'usd', 'user-2', { orderId: 'ord-2', promo: 'SAVE20' });

    expect(result.metadata.orderId).toBe('ord-2');
    expect(result.metadata.promo).toBe('SAVE20');
    expect(result.metadata.instruction).toBe('Pay cash to driver on delivery');
  });

  it('normalizes currency to uppercase', async () => {
    const gateway = createGateway();
    const result = await gateway.createPaymentIntent(100, 'inr', null, {});

    expect(result.currency).toBe('INR');
  });

  it('returns static details for fetchPaymentDetails', async () => {
    const gateway = createGateway();
    const result = await gateway.fetchPaymentDetails('cod_abc123');

    expect(result.id).toBe('cod_abc123');
    expect(result.amount).toBe(0);
    expect(result.currency).toBe('INR');
    expect(result.status).toBe('pending');
    expect(result.payment_method).toBe('cod');
  });

  it('confirms a valid COD payment id', async () => {
    const gateway = createGateway();
    const result = await gateway.confirmPayment('cod_xyz', 'user-1');

    expect(result.id).toBe('cod_xyz');
    expect(result.status).toBe('pending');
    expect(result.payment_method).toBe('cod');
  });

  it('rejects confirmation of a non-COD payment id', async () => {
    const gateway = createGateway();
    await expect(gateway.confirmPayment('pi_123', 'user-1')).rejects.toThrow('Invalid COD payment ID');
  });

  it('rejects confirmation of an empty payment id', async () => {
    const gateway = createGateway();
    await expect(gateway.confirmPayment('', 'user-1')).rejects.toThrow('Invalid COD payment ID');
  });

  it('processes a refund request with a note', async () => {
    const gateway = createGateway();
    const result = await gateway.refundPayment('cod_123', 100, 'user-1', 'customer_requested');

    expect(result.id).toMatch(/^refund_\d+$/);
    expect(result.amount).toBe(100);
    expect(result.currency).toBe('INR');
    expect(result.status).toBe('processed');
    expect(result.note).toBe('COD refund - requires manual driver reconciliation');
  });

  it('processes a refund with null amount defaulting to 0', async () => {
    const gateway = createGateway();
    const result = await gateway.refundPayment('cod_123', null, 'user-1');

    expect(result.amount).toBe(0);
  });

  it('returns empty object for webhook constructEvent', async () => {
    const gateway = createGateway();
    const result = await gateway.constructEvent(Buffer.from('{}'), 'sig', 'secret');

    expect(result.data.object).toEqual({});
  });
});
