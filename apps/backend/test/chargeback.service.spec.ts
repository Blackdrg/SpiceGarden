import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { ChargebackService } from '../src/services/payments/chargeback/chargeback.service';

function createService() {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock';
      return undefined;
    }),
  } as any;

  const service = Object.create(ChargebackService.prototype) as any;
  service.stripe = {
    charges: { retrieve: jest.fn() },
  };
  service.configService = configService;
  service.disputeRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  service.orderRepo = { findOne: jest.fn() };
  service.userRepo = { findOne: jest.fn() };
  service.productionNotification = { sendPaymentNotification: jest.fn() };
  service.logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

  return { service };
}

describe('ChargebackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a dispute record and returns saved entity', async () => {
    const { service } = createService();
    const dispute = {
      id: 'dp_123',
      reason: 'fraudulent',
      amount: 5000,
      currency: 'usd',
      status: 'needs_response',
      evidence: { proof: 'yes' },
      charge: {
        id: 'ch_1',
        payment_intent: 'pi_1',
      },
    };
    service.stripe.charges.retrieve.mockResolvedValue(dispute.charge);
    service.orderRepo.findOne.mockResolvedValue({ id: 'ord-1', userId: 'u1', paymentIntentId: 'pi_1' });
    service.disputeRepo.findOne.mockResolvedValue(null);
    service.disputeRepo.create.mockReturnValue({});
    service.disputeRepo.save.mockResolvedValue({ id: 'disp-1', disputeId: 'dp_123' });

    const result = await service.handleDisputeCreated({ data: { object: dispute } } as any);

    expect(result.disputeId).toBe('dp_123');
    expect(service.disputeRepo.save).toHaveBeenCalled();
    expect(service.productionNotification.sendPaymentNotification).toHaveBeenCalledWith(
      'u1',
      'dp_123',
      expect.objectContaining({ type: 'fraud_detected' })
    );
  });

  it('returns existing dispute if already recorded', async () => {
    const { service } = createService();
    const dispute = {
      id: 'dp_dup',
      reason: 'duplicate',
      amount: 1000,
      currency: 'inr',
      status: 'won',
      evidence: {},
      charge: { payment_intent: 'pi_dup' },
    };
    service.stripe.charges.retrieve.mockResolvedValue(dispute.charge);
    service.orderRepo.findOne.mockResolvedValue({ id: 'ord-dup', userId: 'u2' });
    service.disputeRepo.findOne.mockResolvedValue({ id: 'disp-dup', disputeId: 'dp_dup' });

    const result = await service.handleDisputeCreated({ data: { object: dispute } } as any);

    expect(result.id).toBe('disp-dup');
    expect(service.disputeRepo.save).not.toHaveBeenCalled();
  });

  it('handles missing order gracefully', async () => {
    const { service } = createService();
    const dispute = {
      id: 'dp_noorder',
      reason: 'product_not_received',
      amount: 2000,
      currency: 'usd',
      status: 'needs_response',
      evidence: {},
      charge: { payment_intent: 'pi_missing' },
    };
    service.stripe.charges.retrieve.mockResolvedValue(dispute.charge);
    service.orderRepo.findOne.mockResolvedValue(null);
    service.disputeRepo.findOne.mockResolvedValue(null);
    service.disputeRepo.create.mockReturnValue({});
    service.disputeRepo.save.mockResolvedValue({ id: 'disp-noorder', disputeId: 'dp_noorder' });

    const result = await service.handleDisputeCreated({ data: { object: dispute } } as any);

    expect(result.disputeId).toBe('dp_noorder');
    expect(service.logger.warn).toHaveBeenCalled();
  });

  it('throws InternalServerErrorException on processing failure', async () => {
    const { service } = createService();
    const dispute = {
      id: 'dp_err',
      reason: 'fraudulent',
      amount: 100,
      currency: 'usd',
      status: 'needs_response',
      evidence: {},
      charge: { payment_intent: 'pi_err' },
    };
    service.stripe.charges.retrieve.mockRejectedValue(new Error('Stripe API down'));

    await expect(service.handleDisputeCreated({ data: { object: dispute } } as any)).rejects.toThrow('Failed to process dispute');
    expect(service.logger.error).toHaveBeenCalled();
  });
});
