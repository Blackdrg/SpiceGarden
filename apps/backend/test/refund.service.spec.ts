import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { RefundService } from '../src/services/refund/refund.service';
import { RefundEntity, RefundStatus } from '../src/db/entities/refund.entity';
import { RefundApprovalEntity } from '../src/db/entities/refund-approval.entity';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';
import { OrderEntity } from '../src/db/entities/order.entity';
import { UserEntity } from '../src/db/entities/user.entity';
import { PaymentService } from '../src/services/payments/payments.service';
import { NotificationService } from '../src/services/notifications/notification.service';
import { LedgerService } from '../src/modules/ledger/ledger.service';
import { ProductionNotificationService } from '../src/services/notifications/production-notification.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

function setup() {
  const refundRepo: any = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
  const refundApprovalRepo: any = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
  const orderRepo: any = { findOne: jest.fn(), save: jest.fn(), update: jest.fn() };
  const userRepo: any = { findOne: jest.fn() };
  const paymentSvc: any = { refundPayment: jest.fn() };
  const notifSvc: any = {};
  const ledgerSvc: any = { createTransaction: jest.fn() };
  const prodNotif: any = { sendPaymentNotification: jest.fn() };
  const cfg: any = { get: jest.fn((k: string, d?: any) => k === 'REFUND_MANAGER_APPROVAL_THRESHOLD' ? 1000 : d) };
  const logger: any = { log: jest.fn(), error: jest.fn() };

  const svc = Object.create(RefundService.prototype);
  Object.assign(svc, { refundRepo, refundApprovalRepo, orderRepo, userRepo, paymentService: paymentSvc, notificationService: notifSvc, ledgerService: ledgerSvc, productionNotification: prodNotif, configService: cfg, logger });

  return { svc, refundRepo, refundApprovalRepo, orderRepo, userRepo, paymentSvc, notifSvc, ledgerSvc, prodNotif, cfg, logger };
}

const order = () => ({ id: 'ord-1', userId: 'user-1', status: 'delivered', paymentStatus: 'completed' } as any);
const user = () => ({ id: 'user-1', email: 't@t.com' } as any);

describe('RefundService', () => {
  beforeEach(() => { jest.clearAllMocks(); void 0; });

  describe('isRefundEligible', () => {
    it.each([
      ['delivered', true], ['on_the_way', true], ['ready', true], ['preparing', true], ['cancelled', false],
    ])('isRefundEligible(%s) => %s', (status: string, expected: boolean) => {
      const { svc } = setup();
      expect((svc as any).isRefundEligible({ status })).toBe(expected);
    });
  });

  describe('mapRequestTypeToRefundType', () => {
    it.each([
      ['customer_request', 'customer_refund'],
      ['agent_initiated', 'restaurant_penalty'],
      ['policy_exception', 'customer_refund'],
      ['dispute_resolution', 'customer_refund'],
    ])('%s => %s', (input: string, expected: string) => {
      const { svc } = setup();
      expect((svc as any).mapRequestTypeToRefundType(input)).toBe(expected);
    });
  });

describe('createRefundRequest', () => {
it('creates successfully', async () => {
        const { svc, orderRepo, userRepo, refundApprovalRepo, prodNotif } = setup();
        orderRepo.findOne.mockResolvedValue(order());
        userRepo.findOne.mockResolvedValue(user());
        refundApprovalRepo.findOne.mockResolvedValue(null);
        refundApprovalRepo.create.mockReturnValue({ id: 'a1', approvalStatus: 'pending' });
        refundApprovalRepo.save.mockResolvedValue({ id: 'a1', approvalStatus: 'pending' as const });
        prodNotif.sendPaymentNotification.mockResolvedValue(undefined);

        const r = await svc.createRefundRequest('ord-1', 'user-1', 500, 'Damaged');
        expect(r).toBeDefined();
      });

     it('throws NotFoundException when order missing', async () => {
       const { svc, orderRepo } = setup();
       orderRepo.findOne.mockResolvedValue(null);
       await expect(svc.createRefundRequest('x', 'u', 500, 'r')).rejects.toThrow(NotFoundException);
     });

     it('throws NotFoundException when user missing (non-system)', async () => {
       const { svc, orderRepo, userRepo } = setup();
       orderRepo.findOne.mockResolvedValue(order());
       userRepo.findOne.mockResolvedValue(null);
       await expect(svc.createRefundRequest('ord-1', 'bad-user', 500, 'r')).rejects.toThrow(NotFoundException);
     });

     it('allows system as requestedBy', async () => {
       const { svc, orderRepo, refundApprovalRepo, userRepo } = setup();
       orderRepo.findOne.mockResolvedValue(order());
       refundApprovalRepo.findOne.mockResolvedValue(null);
       refundApprovalRepo.create.mockReturnValue({} as any);
       refundApprovalRepo.save.mockResolvedValue({ id: 'a1', approvalStatus: 'pending' } as any);

       const r = await svc.createRefundRequest('ord-1', 'system', 500, 'r');
       expect(r.id).toBe('a1');
       expect(userRepo.findOne).toHaveBeenCalled();
     });

     it('throws BadRequestException for ineligible order', async () => {
       const { svc, orderRepo, userRepo } = setup();
       const badOrder = { ...order(), status: 'cancelled' };
       orderRepo.findOne.mockResolvedValue(badOrder);
       userRepo.findOne.mockResolvedValue(user());
       await expect(svc.createRefundRequest('ord-1', 'user-1', 500, 'r')).rejects.toThrow(BadRequestException);
     });

     it('throws when already refunded', async () => {
       const { svc, orderRepo, userRepo } = setup();
       orderRepo.findOne.mockResolvedValue({ ...order(), paymentStatus: 'refunded' });
       userRepo.findOne.mockResolvedValue(user());
       await expect(svc.createRefundRequest('ord-1', 'user-1', 500, 'r')).rejects.toThrow('already been refunded');
     });

     it('throws when pending approval exists', async () => {
       const { svc, orderRepo, userRepo, refundApprovalRepo } = setup();
       orderRepo.findOne.mockResolvedValue(order());
       userRepo.findOne.mockResolvedValue(user());
       refundApprovalRepo.findOne.mockResolvedValue({ id: 'existing', approvalStatus: 'pending' } as any);
       await expect(svc.createRefundRequest('ord-1', 'user-1', 500, 'r')).rejects.toThrow('already a pending');
     });

     it('requires manager approval for amount >= threshold', async () => {
       const { svc, cfg, orderRepo, userRepo, refundApprovalRepo } = setup();
       cfg.get.mockImplementation((k: string, d?: any) => k === 'REFUND_MANAGER_APPROVAL_THRESHOLD' ? 500 : d);
       orderRepo.findOne.mockResolvedValue(order());
       userRepo.findOne.mockResolvedValue(user());
       refundApprovalRepo.findOne.mockResolvedValue(null);
       refundApprovalRepo.create.mockReturnValue({} as any);
       refundApprovalRepo.save.mockImplementation((e: any) => ({ ...e }));

       await svc.createRefundRequest('ord-1', 'user-1', 600, 'Large');
       expect(refundApprovalRepo.create).toHaveBeenCalledWith(expect.objectContaining({ requiresManagerApproval: true }));
     });

     it('does not require manager approval for small amount', async () => {
       const { svc, orderRepo, userRepo, refundApprovalRepo } = setup();
       orderRepo.findOne.mockResolvedValue(order());
       userRepo.findOne.mockResolvedValue(user());
       refundApprovalRepo.findOne.mockResolvedValue(null);
       refundApprovalRepo.create.mockReturnValue({} as any);
       refundApprovalRepo.save.mockImplementation((e: any) => ({ ...e }));

       await svc.createRefundRequest('ord-1', 'user-1', 100, 'Small');
       expect(refundApprovalRepo.create).toHaveBeenCalledWith(expect.objectContaining({ requiresManagerApproval: false }));
     });
   });

describe('approveRefundRequest', () => {
     it('should approve', async () => {
       const { svc, refundApprovalRepo, userRepo, prodNotif } = setup();
       const a = { id: 'a1', approvalStatus: 'pending', order: { id: 'ord-1' } } as any;
       refundApprovalRepo.findOne.mockResolvedValue(a);
       userRepo.findOne.mockResolvedValue({ id: 'ap-1' } as any);
       refundApprovalRepo.save.mockImplementation((e: any) => ({ ...e, approvedAt: expect.any(Date) }));
       prodNotif.sendPaymentNotification.mockResolvedValue(undefined);

       const r = await svc.approveRefundRequest('a1', 'ap-1', 'OK');
       expect(r.approvalStatus).toBe('approved');
       expect(r.approverId).toBe('ap-1');
     });

     it('throws for missing approval', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(null);
       await expect(svc.approveRefundRequest('x', 'ap-1')).rejects.toThrow(NotFoundException);
     });

     it('throws for missing approver', async () => {
       const { svc, refundApprovalRepo, userRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue({ id: 'a1', approvalStatus: 'pending' } as any);
       userRepo.findOne.mockResolvedValue(null);
       await expect(svc.approveRefundRequest('a1', 'x')).rejects.toThrow(NotFoundException);
     });

it('throws for already processed', async () => {
        const { svc, refundApprovalRepo, userRepo } = setup();
        refundApprovalRepo.findOne.mockResolvedValue({ id: 'a1', approvalStatus: 'approved' } as any);
        userRepo.findOne.mockResolvedValue({ id: 'ap-1' } as any);
        await expect(svc.approveRefundRequest('a1', 'ap-1')).rejects.toThrow(BadRequestException);
      });
   });

describe('rejectRefundRequest', () => {
     it('should reject', async () => {
       const { svc, refundApprovalRepo, userRepo } = setup();
       const a = { id: 'a1', approvalStatus: 'pending' } as any;
       refundApprovalRepo.findOne.mockResolvedValue(a);
       userRepo.findOne.mockResolvedValue({ id: 'ap-1' } as any);
       refundApprovalRepo.save.mockImplementation((e: any) => ({ ...e }));

       const r = await svc.rejectRefundRequest('a1', 'ap-1', 'Invalid');
       expect(r.approvalStatus).toBe('rejected');
       expect(r.rejectionReason).toBe('Invalid');
     });

     it('throws for missing approval', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(null);
       await expect(svc.rejectRefundRequest('x', 'ap-1', 'r')).rejects.toThrow(NotFoundException);
     });

it('throws for already processed', async () => {
        const { svc, refundApprovalRepo, userRepo } = setup();
        refundApprovalRepo.findOne.mockResolvedValue({ id: 'a1', approvalStatus: 'approved' } as any);
        userRepo.findOne.mockResolvedValue({ id: 'ap-1' } as any);
        await expect(svc.rejectRefundRequest('a1', 'ap-1', 'r')).rejects.toThrow(BadRequestException);
      });
   });

  describe('processRefund', () => {
    const mkApproval = (status: string = 'approved') => ({
      id: 'a1', order: { id: 'ord-1', paymentIntentId: 'pi_1', userId: 'u1', paymentStatus: 'completed' },
      approvalStatus: status, refundAmount: 500, reason: 'requested_by_customer',
      requestedBy: 'u1', requestType: 'customer_request',
    } as any);

    const mkOrder = () => ({
      id: 'ord-1', paymentIntentId: 'pi_1', userId: 'u1',
      status: 'delivered', paymentStatus: 'completed',
    } as any);

it('processes refund successfully', async () => {
        const { svc, refundApprovalRepo, userRepo, orderRepo, paymentSvc, refundRepo, ledgerSvc, prodNotif } = setup();
        refundApprovalRepo.findOne.mockResolvedValue(mkApproval());
        userRepo.findOne.mockImplementation((opts: any) => {
          if (opts?.where?.id === 'processor-1') return { id: 'processor-1' } as any;
          return { id: 'u1' } as any;
        });
        orderRepo.findOne.mockResolvedValue(mkOrder());
        paymentSvc.refundPayment.mockResolvedValue({ id: 're_1', amount: 50000, currency: 'usd' } as any);
        refundRepo.create.mockReturnValue({} as any);
        refundRepo.save.mockImplementation((e: any) => ({ ...e, status: 'processed' }));
        refundApprovalRepo.save.mockImplementation((e: any) => ({ ...e }));
        orderRepo.save.mockImplementation((e: any) => ({ ...e }));
        ledgerSvc.createTransaction.mockResolvedValue(undefined);
        prodNotif.sendPaymentNotification.mockResolvedValue(undefined);

        const r = await svc.processRefund('a1', 'processor-1');
        expect((r as any).refund.status).toBe('processed');
        expect((r as any).approval.approvalStatus).toBe('processed');
        expect(paymentSvc.refundPayment).toHaveBeenCalled();
        // Ledger recording is delegated to PaymentService.refundPayment to avoid
        // double-counting the refund in the ledger.
        expect(ledgerSvc.createTransaction).not.toHaveBeenCalled();
      });

     it('throws NotFoundException for missing approval', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(null);
       await expect(svc.processRefund('x', 'p')).rejects.toThrow(NotFoundException);
     });

it('throws when already processed', async () => {
        const { svc, refundApprovalRepo, userRepo } = setup();
        refundApprovalRepo.findOne.mockResolvedValue(mkApproval('processed'));
        userRepo.findOne.mockResolvedValue({ id: 'p' } as any);
        await expect(svc.processRefund('a1', 'p')).rejects.toThrow(BadRequestException);
      });

     it('throws when not approved', async () => {
        const { svc, refundApprovalRepo, userRepo } = setup();
        refundApprovalRepo.findOne.mockResolvedValue(mkApproval('rejected'));
        userRepo.findOne.mockResolvedValue({ id: 'p' } as any);
        await expect(svc.processRefund('a1', 'p')).rejects.toThrow(BadRequestException);
      });

     it('throws when order not found', async () => {
       const { svc, refundApprovalRepo, userRepo, orderRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(mkApproval());
       userRepo.findOne.mockResolvedValue({ id: 'p' } as any);
       orderRepo.findOne.mockResolvedValue(null);
       await expect(svc.processRefund('a1', 'p')).rejects.toThrow(NotFoundException);
     });

     it('throws when order already refunded', async () => {
       const { svc, refundApprovalRepo, userRepo, orderRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(mkApproval());
       userRepo.findOne.mockResolvedValue({ id: 'p' } as any);
       orderRepo.findOne.mockResolvedValue({ ...mkOrder(), paymentStatus: 'refunded' });
       await expect(svc.processRefund('a1', 'p')).rejects.toThrow('already been refunded');
     });

     it('handles payment service failure', async () => {
       const { svc, refundApprovalRepo, userRepo, orderRepo, paymentSvc } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(mkApproval());
       userRepo.findOne.mockResolvedValue({ id: 'processor-1' } as any);
       orderRepo.findOne.mockResolvedValue(mkOrder());
       userRepo.findOne.mockResolvedValue({ id: 'u1' } as any);
       paymentSvc.refundPayment.mockRejectedValue(new Error('Gateway down'));

       await expect(svc.processRefund('a1', 'processor-1')).rejects.toThrow(InternalServerErrorException);
       expect(refundApprovalRepo.save).toHaveBeenCalled();
     });

    it('does not write a duplicate ledger entry from the refund service', async () => {
        const { svc, refundApprovalRepo, userRepo, orderRepo, paymentSvc, refundRepo, ledgerSvc, prodNotif } = setup();
        refundApprovalRepo.findOne.mockResolvedValue(mkApproval());
        userRepo.findOne.mockImplementation((opts: any) => {
          if (opts?.where?.id === 'processor-1') return { id: 'processor-1' } as any;
          return { id: 'u1' } as any;
        });
        orderRepo.findOne.mockResolvedValue(mkOrder());
        paymentSvc.refundPayment.mockResolvedValue({ id: 're_1', amount: 50000, currency: 'usd' } as any);
        refundRepo.create.mockReturnValue({} as any);
        refundRepo.save.mockImplementation((e: any) => ({ ...e, status: 'processed' }));
        refundApprovalRepo.save.mockImplementation((e: any) => ({ ...e }));
        orderRepo.save.mockImplementation((e: any) => ({ ...e }));
        prodNotif.sendPaymentNotification.mockResolvedValue(undefined);

        const r = await svc.processRefund('a1', 'processor-1');
        expect((r as any).refund.status).toBe('processed');
        expect(ledgerSvc.createTransaction).not.toHaveBeenCalled();
      });
   });

describe('getRefundRequest', () => {
     it('returns approval by id', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue({ id: 'a1' } as any);
       const r = await svc.getRefundRequest('a1');
       expect(r.id).toBe('a1');
     });
     it('throws for missing', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.findOne.mockResolvedValue(null);
       await expect(svc.getRefundRequest('x')).rejects.toThrow(NotFoundException);
     });
   });

   describe('getRefundRequestsForOrder', () => {
     it('returns approvals', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.find.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
       const r = await svc.getRefundRequestsForOrder('ord-1');
       expect(r).toHaveLength(2);
     });
   });

   describe('getRefundRequestsByStatus', () => {
     it('filters by status', async () => {
       const { svc, refundApprovalRepo } = setup();
       refundApprovalRepo.find.mockResolvedValue([{ id: 'a1' }]);
       const r = await svc.getRefundRequestsByStatus('pending');
       expect(r).toHaveLength(1);
     });
   });
 });
