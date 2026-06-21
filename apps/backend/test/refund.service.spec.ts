import { describe, expect, it, beforeEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RefundService, RefundRequestType } from '../src/services/refund/refund.service';
import { RefundStatus } from '../src/db/entities/refund.entity';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';

function createOrder(overrides: any = {}) {
  return {
    id: 'order-1',
    userId: 'user-1',
    restaurantId: 'restaurant-1',
    orderNumber: 'ORD-TEST-001',
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.COMPLETED,
    subtotal: 100,
    tax: 18,
    deliveryFee: 20,
    discount: 0,
    tip: 0,
    grandTotal: 138,
    paymentIntentId: 'pi_1',
    deliveryAddressId: 'address-1',
    createdAt: new Date('2026-06-21T00:00:00.000Z'),
    updatedAt: new Date('2026-06-21T00:00:00.000Z'),
    ...overrides,
  };
}

function createService() {
  const refundRepo = { create: jest.fn(), save: jest.fn() };
  const refundApprovalRepo = { create: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const orderRepo = { findOne: jest.fn(), save: jest.fn() };
  const userRepo = { findOne: jest.fn() };
  const paymentService = { refundPayment: jest.fn() };
  const notificationService = { sendPush: jest.fn() };
  const ledgerService = { createTransaction: jest.fn() };
  const productionNotification = { sendPaymentNotification: jest.fn() };
  const configService = { get: jest.fn((key: string, fallback: any) => fallback) };
  const logger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

  const service = Object.create(RefundService.prototype) as RefundService;
  Object.assign(service, {
    refundRepo,
    refundApprovalRepo,
    orderRepo,
    userRepo,
    paymentService,
    notificationService,
    ledgerService,
    productionNotification,
    configService,
    logger,
  });

  return { service, refundRepo, refundApprovalRepo, orderRepo, userRepo, paymentService, ledgerService, productionNotification };
}

describe('RefundService approval workflow', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    mocks = createService();
  });

  it('creates a pending refund request for eligible orders', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder());
    mocks.userRepo.findOne.mockResolvedValue({ id: 'user-1' });
    mocks.refundApprovalRepo.findOne.mockResolvedValue(null);
    mocks.refundApprovalRepo.create.mockReturnValue({ id: 'approval-1', order: createOrder(), refundAmount: 138, approvalStatus: 'pending' });
    mocks.refundApprovalRepo.save.mockResolvedValue({ id: 'approval-1', order: createOrder(), refundAmount: 138, approvalStatus: 'pending' });

    const result = await mocks.service.createRefundRequest('order-1', 'user-1', 138, 'Late delivery', RefundRequestType.CUSTOMER_REQUEST);

    expect(result.approvalStatus).toBe('pending');
    expect(mocks.refundApprovalRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      refundAmount: 138,
      reason: 'Late delivery',
      requestType: RefundRequestType.CUSTOMER_REQUEST,
      approvalStatus: 'pending',
    }));
    expect(mocks.productionNotification.sendPaymentNotification).toHaveBeenCalled();
  });

  it('rejects duplicate pending refund requests', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder());
    mocks.userRepo.findOne.mockResolvedValue({ id: 'user-1' });
    mocks.refundApprovalRepo.findOne.mockResolvedValue({ id: 'approval-1', approvalStatus: 'pending' });

    await expect(mocks.service.createRefundRequest('order-1', 'user-1', 138, 'Late delivery')).rejects.toThrow(BadRequestException);
    expect(mocks.refundApprovalRepo.create).not.toHaveBeenCalled();
  });

  it('approves pending refund requests', async () => {
    const approval = { id: 'approval-1', approvalStatus: 'pending', order: createOrder() };
    mocks.refundApprovalRepo.findOne.mockResolvedValue(approval);
    mocks.userRepo.findOne.mockResolvedValue({ id: 'approver-1' });
    mocks.refundApprovalRepo.save.mockResolvedValue({ ...approval, approvalStatus: 'approved', approverId: 'approver-1' });

    const result = await mocks.service.approveRefundRequest('approval-1', 'approver-1', 'Approved');

    expect(result.approvalStatus).toBe('approved');
    expect(result.approverId).toBe('approver-1');
  });

  it('rejects non-pending refund requests', async () => {
    mocks.refundApprovalRepo.findOne.mockResolvedValue({ id: 'approval-1', approvalStatus: 'processed', order: createOrder() });
    mocks.userRepo.findOne.mockResolvedValue({ id: 'approver-1' });

    await expect(mocks.service.rejectRefundRequest('approval-1', 'approver-1', 'Already processed')).rejects.toThrow(BadRequestException);
  });

  it('processes approved refunds and marks the order refunded', async () => {
    const approval = {
      id: 'approval-1',
      approvalStatus: 'approved',
      approverId: 'approver-1',
      approvedAt: new Date('2026-06-21T00:00:00.000Z'),
      order: createOrder(),
      refundAmount: 138,
      reason: 'Late delivery',
      requestType: RefundRequestType.CUSTOMER_REQUEST,
      approvalNotes: 'Approved',
    };
    const order = createOrder();
    mocks.refundApprovalRepo.findOne.mockResolvedValue(approval);
    mocks.userRepo.findOne.mockResolvedValueOnce({ id: 'processor-1' }).mockResolvedValueOnce({ id: 'user-1' });
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.paymentService.refundPayment.mockResolvedValue({ id: 're_1', amount: 13800, currency: 'usd', status: 'succeeded' });
    mocks.refundRepo.create.mockReturnValue({ id: 'refund-1' });
    mocks.refundRepo.save.mockResolvedValue({ id: 'refund-1', status: RefundStatus.PROCESSED });
    mocks.refundApprovalRepo.save.mockResolvedValue({ ...approval, approvalStatus: 'processed', processedBy: 'processor-1' });
    mocks.orderRepo.save.mockResolvedValue(order);
    mocks.ledgerService.createTransaction.mockResolvedValue(undefined);

    const result = await mocks.service.processRefund('approval-1', 'processor-1');

    expect(result.refund.status).toBe(RefundStatus.PROCESSED);
    expect(result.approval.approvalStatus).toBe('processed');
    expect(order.paymentStatus).toBe(PaymentStatus.REFUNDED);
    expect(mocks.paymentService.refundPayment).toHaveBeenCalledWith('pi_1', 138, 'user-1', 'Late delivery', undefined, undefined);
    expect(mocks.productionNotification.sendPaymentNotification).toHaveBeenCalled();
  });

  it('rejects processing when approval is not approved', async () => {
    mocks.refundApprovalRepo.findOne.mockResolvedValue({ id: 'approval-1', approvalStatus: 'pending', order: createOrder() });
    mocks.userRepo.findOne.mockResolvedValue({ id: 'processor-1' });

    await expect(mocks.service.processRefund('approval-1', 'processor-1')).rejects.toThrow(BadRequestException);
  });

  it('checks refund eligibility for delivered and on-the-way orders', () => {
    const service = mocks.service as any;

    expect(service.isRefundEligible(createOrder({ status: OrderStatus.DELIVERED }))).toBe(true);
    expect(service.isRefundEligible(createOrder({ status: OrderStatus.ON_THE_WAY }))).toBe(true);
    expect(service.isRefundEligible(createOrder({ status: OrderStatus.PLACED }))).toBe(false);
  });

  it('maps request types to refund types', () => {
    const service = mocks.service as any;

    expect(service.mapRequestTypeToRefundType(RefundRequestType.CUSTOMER_REQUEST)).toBe('customer_refund');
    expect(service.mapRequestTypeToRefundType(RefundRequestType.AGENT_INITIATED)).toBe('restaurant_penalty');
    expect(service.mapRequestTypeToRefundType(RefundRequestType.DISPUTE_RESOLUTION)).toBe('customer_refund');
  });

  it('throws when requested user does not exist', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder());
    mocks.userRepo.findOne.mockResolvedValue(null);

    await expect(mocks.service.createRefundRequest('order-1', 'missing-user', 138, 'Late delivery')).rejects.toThrow(NotFoundException);
  });
});
