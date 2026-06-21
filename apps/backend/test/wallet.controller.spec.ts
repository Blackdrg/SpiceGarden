import { describe, expect, it, beforeEach } from '@jest/globals';
import { WalletController } from '../src/services/wallet/wallet.controller';

describe('WalletController request parsing', () => {
  let walletService: any;
  let controller: WalletController;

  beforeEach(() => {
    walletService = {
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
    controller = new WalletController(walletService);
  });

  it('reads transaction pagination from query parameters', async () => {
    walletService.getWalletTransactions.mockResolvedValue([{ id: 'txn-1' }]);

    const result = await controller.getTransactions(
      { user: { id: 'user-1' } } as any,
      '5' as any,
      '20' as any,
    );

    expect(result).toEqual([{ id: 'txn-1' }]);
    expect(walletService.getWalletTransactions).toHaveBeenCalledWith('user-1', '5', '20');
  });

  it('uses authenticated user id for wallet reads', async () => {
    walletService.getWallet.mockResolvedValue({ id: 'wallet-1', userId: 'user-1', balance: 100 });

    await expect(controller.getWallet({ user: { id: 'user-1' } } as any)).resolves.toEqual({ id: 'wallet-1', userId: 'user-1', balance: 100 });
    expect(walletService.getWallet).toHaveBeenCalledWith('user-1');
  });
});
