import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { SettlementService } from '../src/services/finance/settlement.service';
import { PaymentStatus } from '../src/shared/domain/order.interface';

function createService() {
  const settlementRepo: any = { find: jest.fn(), create: jest.fn(), save: jest.fn(), findOne: jest.fn() };
  const payoutRepo: any = { findOne: jest.fn() };
  const orderRepo: any = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const restaurantRepo: any = { findOne: jest.fn() };
  const dataSource: any = { manager: { transaction: jest.fn() } };

  const service = new SettlementService(settlementRepo, payoutRepo, orderRepo, restaurantRepo, dataSource) as any;
  return { service, settlementRepo, orderRepo };
}

describe('SettlementService reconciliation', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    mocks = createService();
  });

  it('returns matched status when all completed orders have settlements and amounts match', async () => {
    mocks.orderRepo.find.mockResolvedValue([
      { id: 'ord-1', grandTotal: 1000, paymentIntentId: 'phonepe_1' },
      { id: 'ord-2', grandTotal: 500, paymentIntentId: 'phonepe_2' },
    ]);
    mocks.settlementRepo.find.mockResolvedValue([
      { netAmount: 1500, transactions: [{ referenceId: 'ord-1' }, { referenceId: 'ord-2' }] },
    ]);

    const result = await mocks.service.reconcileGatewayPayments('phonepe', new Date('2025-01-01'), new Date('2025-01-31'));

    expect(result.status).toBe('matched');
    expect(result.totalOrders).toBe(2);
    expect(result.totalOrderAmount).toBe(1500);
    expect(result.totalSettledAmount).toBe(1500);
    expect(result.unsettledOrders).toHaveLength(0);
    expect(result.settledCount).toBe(2);
  });

  it('flags unsettled orders when some are missing from settlements', async () => {
    mocks.orderRepo.find.mockResolvedValue([
      { id: 'ord-1', grandTotal: 1000, paymentIntentId: 'phonepe_1' },
      { id: 'ord-2', grandTotal: 500, paymentIntentId: 'phonepe_2' },
      { id: 'ord-3', grandTotal: 300, paymentIntentId: 'phonepe_3' },
    ]);
    mocks.settlementRepo.find.mockResolvedValue([
      { netAmount: 800, transactions: [{ referenceId: 'ord-1' }] },
    ]);

    const result = await mocks.service.reconcileGatewayPayments('phonepe', new Date('2025-01-01'), new Date('2025-01-31'));

    expect(result.status).toBe('discrepancy');
    expect(result.unsettledOrders).toHaveLength(2);
    expect(result.unsettledOrders).toContainEqual({ orderId: 'ord-2', amount: 500 });
    expect(result.unsettledOrders).toContainEqual({ orderId: 'ord-3', amount: 300 });
    expect(result.settledCount).toBe(1);
    expect(result.amountMismatch).toBe(1000);
  });

  it('filters by completed payment status only', async () => {
    mocks.orderRepo.find.mockResolvedValue([
      { id: 'ord-1', grandTotal: 1000, paymentIntentId: 'phonepe_1' },
    ]);
    mocks.settlementRepo.find.mockResolvedValue([]);

    await mocks.service.reconcileGatewayPayments('phonepe', new Date('2025-01-01'), new Date('2025-01-31'));

    expect(mocks.orderRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        paymentStatus: PaymentStatus.COMPLETED,
      }),
    }));
  });

  it('aggregates transactions across multiple settlement batches', async () => {
    mocks.orderRepo.find.mockResolvedValue([
      { id: 'ord-1', grandTotal: 400, paymentIntentId: 'phonepe_1' },
      { id: 'ord-2', grandTotal: 600, paymentIntentId: 'phonepe_2' },
    ]);
    mocks.settlementRepo.find.mockResolvedValue([
      { netAmount: 400, transactions: [{ referenceId: 'ord-1' }] },
      { netAmount: 600, transactions: [{ referenceId: 'ord-2' }] },
    ]);

    const result = await mocks.service.reconcileGatewayPayments('phonepe', new Date('2025-01-01'), new Date('2025-01-31'));

    expect(result.totalSettledAmount).toBe(1000);
    expect(result.unsettledOrders).toHaveLength(0);
    expect(result.status).toBe('matched');
  });

  it('handles settlements with no transactions property', async () => {
    mocks.orderRepo.find.mockResolvedValue([
      { id: 'ord-1', grandTotal: 500, paymentIntentId: 'paytm_1' },
    ]);
    mocks.settlementRepo.find.mockResolvedValue([
      { netAmount: 500 },
    ]);

    const result = await mocks.service.reconcileGatewayPayments('paytm', new Date('2025-01-01'), new Date('2025-01-31'));

    expect(result.status).toBe('discrepancy');
    expect(result.unsettledOrders).toHaveLength(1);
    expect(result.settledCount).toBe(0);
  });
});
