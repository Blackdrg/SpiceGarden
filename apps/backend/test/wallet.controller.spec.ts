import { describe, expect, it, beforeEach } from '@jest/globals';
import { WalletController } from '../src/services/wallet/wallet.controller';

function createController() {
  const walletService = {
    getWallet: jest.fn(),
    getWalletBalance: jest.fn(),
    getWalletTransactions: jest.fn(),
    creditWallet: jest.fn(),
    debitWallet: jest.fn(),
    compensateUser: jest.fn(),
    processCODPayment: jest.fn(),
    confirmCODCollection: jest.fn(),
    refundCOD: jest.fn(),
    preventDoublePayment: jest.fn(),
  };

  const controller = new WalletController(walletService as any);
  return { controller, walletService };
}

describe('WalletController', () => {
  let mocks: ReturnType<typeof createController>;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks = createController();
  });

  const authReq = (overrides: any = {}) => ({
    user: { id: 'user-1', role: 'customer', status: 'active', ...overrides.user },
    ...overrides,
  });

  it('returns wallet for getWallet', async () => {
    mocks.walletService.getWallet.mockResolvedValue({ id: 'w1', balance: 100 });
    const result = await mocks.controller.getWallet(authReq() as any);
    expect(result).toEqual({ id: 'w1', balance: 100 });
    expect(mocks.walletService.getWallet).toHaveBeenCalledWith('user-1');
  });

  it('returns balance for getBalance', async () => {
    mocks.walletService.getWalletBalance.mockResolvedValue(250);
    const result = await mocks.controller.getBalance(authReq() as any);
    expect(result).toBe(250);
    expect(mocks.walletService.getWalletBalance).toHaveBeenCalledWith('user-1');
  });

  it('returns transactions with pagination', async () => {
    mocks.walletService.getWalletTransactions.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
    const result = await mocks.controller.getTransactions(authReq() as any, 10, 5);
    expect(result).toHaveLength(2);
    expect(mocks.walletService.getWalletTransactions).toHaveBeenCalledWith('user-1', 10, 5);
  });

  it('credits wallet', async () => {
    mocks.walletService.creditWallet.mockResolvedValue({ id: 't1', type: 'credit' });
    const result = await mocks.controller.creditWallet(
      authReq({ user: { id: 'user-1', role: 'admin' } }) as any,
      500,
      'bonus',
      'ref-1'
    );
    expect(result).toEqual({ id: 't1', type: 'credit' });
    expect(mocks.walletService.creditWallet).toHaveBeenCalledWith('user-1', 500, 'bonus', 'ref-1');
  });

  it('debits wallet', async () => {
    mocks.walletService.debitWallet.mockResolvedValue({ id: 't2', type: 'debit' });
    const result = await mocks.controller.debitWallet(
      authReq({ user: { id: 'user-1', role: 'admin' } }) as any,
      200,
      'purchase',
      'ref-2'
    );
    expect(result).toEqual({ id: 't2', type: 'debit' });
    expect(mocks.walletService.debitWallet).toHaveBeenCalledWith('user-1', 200, 'purchase', 'ref-2');
  });

  it('compensates user', async () => {
    mocks.walletService.compensateUser.mockResolvedValue({ id: 't3', type: 'credit' });
    const result = await mocks.controller.compensateUser(
      authReq({ user: { id: 'user-1', role: 'super_admin' } }) as any,
      1000,
      'order_issue'
    );
    expect(result).toEqual({ id: 't3', type: 'credit' });
    expect(mocks.walletService.compensateUser).toHaveBeenCalledWith('user-1', 1000, 'order_issue');
  });

  it('processes COD payment', async () => {
    mocks.walletService.processCODPayment.mockResolvedValue({ id: 't4' });
    const result = await mocks.controller.processCODPayment(
      authReq() as any,
      'order-1',
      350
    );
    expect(result).toEqual({ id: 't4' });
    expect(mocks.walletService.processCODPayment).toHaveBeenCalledWith('order-1', 350, 'user-1');
  });

  it('confirms COD collection', async () => {
    mocks.walletService.confirmCODCollection.mockResolvedValue({ id: 't5' });
    const result = await mocks.controller.confirmCODCollection(
      authReq({ user: { id: 'driver-1', role: 'delivery_partner' } }) as any,
      'order-1',
      350
    );
    expect(result).toEqual({ id: 't5' });
    expect(mocks.walletService.confirmCODCollection).toHaveBeenCalledWith('order-1', 350, 'driver-1');
  });

  it('refunds COD', async () => {
    mocks.walletService.refundCOD.mockResolvedValue({ id: 't6' });
    const result = await mocks.controller.refundCOD(
      authReq({ user: { id: 'admin-1', role: 'admin' } }) as any,
      'order-1',
      350,
      'customer_request'
    );
    expect(result).toEqual({ id: 't6' });
    expect(mocks.walletService.refundCOD).toHaveBeenCalledWith('order-1', 350, 'admin-1', 'customer_request');
  });

  it('prevents duplicate payment', async () => {
    mocks.walletService.preventDoublePayment.mockResolvedValue(true);
    const result = await mocks.controller.preventDuplicatePayment(authReq() as any, 'order-1', 300);
    expect(result).toEqual({ allowed: true });
    expect(mocks.walletService.preventDoublePayment).toHaveBeenCalledWith('user-1', 'order-1', 300);
  });
});
