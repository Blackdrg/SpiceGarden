import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { PaymentService } from '../src/services/payments/payments.service';
import { PaymentGateway } from '../src/services/payments/gateways/payment-gateway.interface';

function createPaymentService(gateway: PaymentGateway) {
  const configService = { get: jest.fn((key: string, fallback: number) => {
    if (key === 'PAYMENT_MAX_SINGLE_AMOUNT') return 10000;
    if (key === 'PAYMENT_DAILY_LIMIT_PER_USER') return 50000;
    return fallback;
  }) } as any;
  const auditService: any = { logPaymentEvent: jest.fn().mockReturnValue(Promise.resolve(undefined)) };
  const ledgerService: any = { createTransaction: jest.fn().mockReturnValue(Promise.resolve(undefined)) };
  const gatewayFactory: any = { getGateway: jest.fn().mockReturnValue(gateway) };
  const walletRepo: any = { findOne: jest.fn().mockReturnValue(Promise.resolve(null)) };
  const transactionRepo: any = {
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockReturnValue(Promise.resolve({ total: '0' })),
    }),
  };

  return {
    service: new PaymentService(configService, auditService, ledgerService, gatewayFactory, walletRepo, transactionRepo) as any,
    auditService,
    ledgerService,
    gatewayFactory,
  };
}

describe('PaymentService money-sensitive controls', () => {
  it('creates payment intents through the selected gateway and records audit events', async () => {
    const gateway: any = {
      getGatewayName: jest.fn(() => 'stripe'),
      createPaymentIntent: jest.fn().mockReturnValue(Promise.resolve({ id: 'pi_1', amount: 2500, currency: 'usd', status: 'requires_payment_method' })),
      confirmPayment: jest.fn(),
      refundPayment: jest.fn(),
      constructEvent: jest.fn(),
    };
    const { service, auditService, gatewayFactory } = createPaymentService(gateway as any);

    const result = await service.createPaymentIntent(25, 'usd', 'user-1', { orderId: 'order-1' }, { ip: '127.0.0.1' } as any);

    expect(result).toEqual({ id: 'pi_1', amount: 2500, currency: 'usd', status: 'requires_payment_method' });
    expect(gatewayFactory.getGateway).toHaveBeenCalledWith(undefined);
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(25, 'usd', 'user-1', { orderId: 'order-1' });
    expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
      'payment_intent_created',
      'user-1',
      25,
      'usd',
      'stripe',
      'pi_1',
      true,
      expect.any(Object),
    );
  });

  it('rejects payment amounts above configured maximum before contacting the gateway', async () => {
    const gateway: any = {
      getGatewayName: jest.fn(() => 'stripe'),
      createPaymentIntent: jest.fn(),
      confirmPayment: jest.fn(),
      refundPayment: jest.fn(),
      constructEvent: jest.fn(),
    };
    const { service, auditService } = createPaymentService(gateway as any);

    await expect(service.createPaymentIntent(10001, 'usd', 'user-1')).rejects.toThrow(BadRequestException);
    expect(gateway.createPaymentIntent).not.toHaveBeenCalled();
    expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
      'payment_intent_failed',
      'user-1',
      10001,
      'usd',
      'any',
      '',
      false,
      undefined,
      expect.stringContaining('maximum allowed'),
    );
  });

  it('rejects non-positive refund amounts before gateway refund', async () => {
    const gateway: any = {
      getGatewayName: jest.fn(() => 'stripe'),
      createPaymentIntent: jest.fn(),
      confirmPayment: jest.fn().mockReturnValue(Promise.resolve({ id: 'pi_1', amount: 2500, currency: 'usd', status: 'succeeded' })),
      refundPayment: jest.fn(),
      constructEvent: jest.fn(),
      fetchPaymentDetails: jest.fn().mockReturnValue(Promise.resolve({ id: 'pi_1', amount: 2500, currency: 'usd' })),
    };
    const { service, auditService } = createPaymentService(gateway as any);

    await expect(service.refundPayment('pi_1', 0, 'user-1', 'requested_by_customer')).rejects.toThrow(BadRequestException);
    expect(gateway.refundPayment).not.toHaveBeenCalled();
    expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
      'payment_refund_failed',
      'user-1',
      0,
      'usd',
      'any',
      'pi_1',
      false,
      undefined,
      expect.stringContaining('greater than zero'),
    );
  });

  it('records ledger entries for confirmed payments and swallows ledger failures', async () => {
    const gateway: any = {
      getGatewayName: jest.fn(() => 'stripe'),
      createPaymentIntent: jest.fn(),
      confirmPayment: jest.fn().mockReturnValue(Promise.resolve({ id: 'pi_1', amount: 2500, currency: 'usd', status: 'succeeded' })),
      refundPayment: jest.fn(),
      constructEvent: jest.fn(),
    };
    const { service, ledgerService } = createPaymentService(gateway as any);
    ledgerService.createTransaction.mockRejectedValueOnce(new Error('ledger down'));

    const result = await service.confirmPayment('pi_1', 'user-1');

    expect(result.status).toBe('succeeded');
    expect(ledgerService.createTransaction).toHaveBeenCalledWith(
      'pi_1',
      'cash',
      'revenue',
      25,
      'usd',
      'payment',
      'pi_1',
      'Payment succeeded for order pi_1',
    );
  });
});
