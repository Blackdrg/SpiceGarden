import { WalletService } from './wallet.service';
interface AuthenticatedRequest {
    user: {
        id: string;
    };
}
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getWallet(req: AuthenticatedRequest): unknown;
    getBalance(req: AuthenticatedRequest): unknown;
    getTransactions(req: AuthenticatedRequest, limit?: number, offset?: number): unknown;
    creditWallet(req: AuthenticatedRequest, amount: number, description: string, referenceId?: string): unknown;
    debitWallet(req: AuthenticatedRequest, amount: number, description: string, referenceId?: string): unknown;
    compensateUser(req: AuthenticatedRequest, amount: number, reason: string): unknown;
    processCODPayment(req: AuthenticatedRequest, orderId: string, amount: string | number): unknown;
    confirmCODCollection(req: AuthenticatedRequest, orderId: string, amount: string | number): unknown;
    refundCOD(req: AuthenticatedRequest, orderId: string, amount: string | number, reason: string): unknown;
    preventDuplicatePayment(req: AuthenticatedRequest, orderId: string, amount: number): unknown;
}
export {};
