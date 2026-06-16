import { WalletService } from './wallet.service';
interface AuthenticatedRequest {
    user: {
        id: string;
    };
}
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getWallet(req: AuthenticatedRequest): Promise<import("../../db/entities/wallet.entity").WalletEntity>;
    getBalance(req: AuthenticatedRequest): Promise<{
        balance: number;
        currency: string;
    }>;
    getTransactions(req: AuthenticatedRequest, limit?: number, offset?: number): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity[]>;
    creditWallet(req: AuthenticatedRequest, amount: number, description: string, referenceId?: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    debitWallet(req: AuthenticatedRequest, amount: number, description: string, referenceId?: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    compensateUser(req: AuthenticatedRequest, amount: number, reason: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    processCODPayment(req: AuthenticatedRequest, orderId: string, amount: string | number): Promise<boolean>;
    confirmCODCollection(req: AuthenticatedRequest, orderId: string, amount: string | number): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    refundCOD(req: AuthenticatedRequest, orderId: string, amount: string | number, reason: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    preventDuplicatePayment(req: AuthenticatedRequest, orderId: string, amount: number): Promise<{
        allowed: boolean;
    }>;
}
export {};
