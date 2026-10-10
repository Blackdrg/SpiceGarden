import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { ChargebackService } from '../src/services/payments/chargeback/chargeback.service';
import Stripe from 'stripe';

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
  service.disputeRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn(), count: jest.fn(), createQueryBuilder: jest.fn() };
  service.orderRepo = { findOne: jest.fn(), update: jest.fn() };
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

  describe('handleDisputeClosed', () => {
    it('should update dispute status and return updated entity', async () => {
      const { service } = createService();
      const existingDispute = { id: 'disp-1', disputeId: 'dp_123', orderId: 'ord-1', status: 'needs_response', chargedBackAmount: null, chargedBackAt: null, isRefundedToCustomer: false } as any;
      service.disputeRepo.findOne.mockResolvedValue(existingDispute);
      service.disputeRepo.save.mockResolvedValue({ ...existingDispute, status: 'won' } as any);
      service.orderRepo.findOne.mockResolvedValue({ id: 'ord-1', userId: 'u1' } as any);

      const result = await service.handleDisputeClosed({
        data: {
          object: {
            id: 'dp_123',
            status: 'won',
            chargeback_amount: 5000,
            chargeback_at: 1719000000,
          } as unknown as Stripe.Dispute,
        }
      } as any);

      expect(result.status).toBe('won');
      expect(service.disputeRepo.save).toHaveBeenCalled();
      expect(service.productionNotification.sendPaymentNotification).toHaveBeenCalledWith(
        'u1',
        'chargeback-resolution-dp_123',
        expect.objectContaining({ type: 'payment_success' })
      );
    });

    it('should throw InternalServerErrorException when dispute not found (catch wraps not found)', async () => {
      const { service } = createService();
      service.disputeRepo.findOne.mockResolvedValue(null);

      await expect(service.handleDisputeClosed({
        data: { object: { id: 'dp_missing', status: 'lost' } as any }
      } as any)).rejects.toThrow('Failed to process dispute closure');
    });

    it('should not send notification when orderId is missing', async () => {
      const { service } = createService();
      const existingDispute = { id: 'disp-1', disputeId: 'dp_noorder', orderId: null, status: 'lost', chargedBackAmount: null, chargedBackAt: null, isRefundedToCustomer: false } as any;
      service.disputeRepo.findOne.mockResolvedValue(existingDispute);
      service.disputeRepo.save.mockResolvedValue({ ...existingDispute, status: 'lost' } as any);
      service.orderRepo.findOne.mockResolvedValue(null);

      const result = await service.handleDisputeClosed({
        data: {
          object: {
            id: 'dp_noorder',
            status: 'lost',
          }
        }
      } as any);

      expect(result.status).toBe('lost');
      expect(service.productionNotification.sendPaymentNotification).not.toHaveBeenCalled();
    });

    it('should handle won status without refund', async () => {
      const { service } = createService();
      const existingDispute = { id: 'disp-won', disputeId: 'dp_won', orderId: 'ord-1', status: 'needs_response', chargedBackAmount: null, chargedBackAt: null, isRefundedToCustomer: false } as any;
      service.disputeRepo.findOne.mockResolvedValue(existingDispute);
      service.disputeRepo.save.mockResolvedValue({ ...existingDispute, status: 'won' } as any);
      service.orderRepo.findOne.mockResolvedValue({ id: 'ord-1', userId: 'u1' } as any);

      const result = await service.handleDisputeClosed({
        data: {
          object: {
            id: 'dp_won',
            status: 'won',
          }
        }
      } as any);

      expect(result.status).toBe('won');
      expect(service.logger.log).toHaveBeenCalledWith(expect.stringContaining('won'));
    });
  });

  describe('getDisputeById', () => {
    it('should return dispute when found', async () => {
      const { service } = createService();
      service.disputeRepo.findOne.mockResolvedValue({ id: 'disp-1', disputeId: 'dp_1' } as any);

      const result = await service.getDisputeById('dp_1');

      expect(result.disputeId).toBe('dp_1');
    });

    it('should throw NotFoundException when dispute not found', async () => {
      const { service } = createService();
      service.disputeRepo.findOne.mockResolvedValue(null);

      await expect(service.getDisputeById('dp_missing')).rejects.toThrow('Dispute dp_missing not found');
    });
  });

  describe('getDisputesForOrder', () => {
    it('should return disputes for an order', async () => {
      const { service } = createService();
      service.disputeRepo.find.mockResolvedValue([{ id: 'd1', orderId: 'ord-1' }] as any);

      const result = await service.getDisputesForOrder('ord-1');

      expect(result).toHaveLength(1);
      expect(service.disputeRepo.find).toHaveBeenCalledWith({
        where: { orderId: 'ord-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getDisputesByStatus', () => {
    it('should filter disputes by status', async () => {
      const { service } = createService();
      service.disputeRepo.find.mockResolvedValue([{ id: 'd1', status: 'won' }] as any);

      const result = await service.getDisputesByStatus('won');

      expect(result).toHaveLength(1);
    });
  });

  describe('getDisputeStats', () => {
    it('should return statistics for a date range', async () => {
      const { service } = createService();
      service.disputeRepo.count.mockResolvedValue(10);
      const getRawOne5000 = jest.fn().mockResolvedValue({ total: '5000' } as unknown as never);
      const getRawOne1200 = jest.fn().mockResolvedValue({ total: '1200' } as unknown as never);
      const mockQB1 = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: getRawOne5000,
      };
      const mockQB2 = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: getRawOne1200,
      };
      let callCount = 0;
      service.disputeRepo.createQueryBuilder.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockQB1 : mockQB2;
      });

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-06-23');

      const result = await service.getDisputeStats(startDate, endDate);

      expect(result.totalDisputes).toBe(10);
      expect(result.totalDisputedAmount).toBe('5000');
      expect(result.totalChargedBackAmount).toBe('1200');
    });

    it('should handle stats without date filters', async () => {
      const { service } = createService();
      service.disputeRepo.count.mockResolvedValue(0);
      service.disputeRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      } as any);

      const result = await service.getDisputeStats();

      expect(result.totalDisputes).toBe(0);
      expect(result.winRate).toBe(0);
    });
  });

  describe('mapStripeDisputeStatus', () => {
    it('should map warning status', () => {
      const { service } = createService();
      const result = (service as any).mapStripeDisputeStatus('warning');
      expect(result).toBe('warning');
    });

    it('should map needs_response status', () => {
      const { service } = createService();
      const result = (service as any).mapStripeDisputeStatus('needs_response');
      expect(result).toBe('needs_response');
    });

    it('should map under_review status', () => {
      const { service } = createService();
      const result = (service as any).mapStripeDisputeStatus('under_review');
      expect(result).toBe('under_review');
    });

    it('should map won status', () => {
      const { service } = createService();
      const result = (service as any).mapStripeDisputeStatus('won');
      expect(result).toBe('won');
    });

    it('should map lost status', () => {
      const { service } = createService();
      const result = (service as any).mapStripeDisputeStatus('lost');
      expect(result).toBe('lost');
    });

    it('should return under_review for unknown status', () => {
      const { service } = createService();
      const result = (service as any).mapStripeDisputeStatus('unknown_status');
      expect(result).toBe('under_review');
    });
  });

  describe('initiateRefundForWonDispute', () => {
    it('should initiate refund for a won dispute', async () => {
      const { service } = createService();
      const existingDispute = { id: 'disp-1', disputeId: 'dp_won_refund', orderId: 'ord-1', order: { id: 'ord-1', userId: 'u1' }, status: 'won', isRefundedToCustomer: false, disputedAmount: 500, currency: 'usd' } as any;
      service.disputeRepo.findOne.mockResolvedValue(existingDispute);
      service.disputeRepo.save.mockResolvedValue({ ...existingDispute, isRefundedToCustomer: true } as any);
      service.orderRepo.findOne.mockResolvedValue({ id: 'ord-1', userId: 'u1' } as any);
      service.orderRepo.update.mockResolvedValue(undefined);

      const result = await service.initiateRefundForWonDispute('dp_won_refund', 'admin-1', 'stripe');

      expect(result.isRefundedToCustomer).toBe(true);
      expect(service.disputeRepo.save).toHaveBeenCalled();
      expect(service.orderRepo.update).toHaveBeenCalledWith('ord-1', { paymentIntentId: '' });
      expect(service.productionNotification.sendPaymentNotification).toHaveBeenCalledWith(
        'u1',
        'refund-dp_won_refund',
        expect.objectContaining({ type: 'payment_success' })
      );
    });

    it('should throw NotFoundException when dispute not found', async () => {
      const { service } = createService();
      service.disputeRepo.findOne.mockResolvedValue(null);

      await expect(service.initiateRefundForWonDispute('dp_missing', 'admin-1')).rejects.toThrow('Chargeback dispute dp_missing not found');
    });

    it('should throw BadRequestException when dispute is not won', async () => {
      const { service } = createService();
      const existingDispute = { id: 'disp-1', disputeId: 'dp_lost', status: 'lost', isRefundedToCustomer: false } as any;
      service.disputeRepo.findOne.mockResolvedValue(existingDispute);

      await expect(service.initiateRefundForWonDispute('dp_lost', 'admin-1')).rejects.toThrow('Only won disputes are eligible for refund');
    });

    it('should return dispute if already refunded', async () => {
      const { service } = createService();
      const existingDispute = { id: 'disp-1', disputeId: 'dp_done', status: 'won', isRefundedToCustomer: true } as any;
      service.disputeRepo.findOne.mockResolvedValue(existingDispute);

      const result = await service.initiateRefundForWonDispute('dp_done', 'admin-1');

      expect(result.isRefundedToCustomer).toBe(true);
      expect(service.disputeRepo.save).not.toHaveBeenCalled();
    });
  });
});
