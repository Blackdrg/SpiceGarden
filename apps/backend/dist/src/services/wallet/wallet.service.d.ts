import { DataSource } from 'typeorm';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../payments/payments.service';
import { NotificationService } from '../notifications/notification.service';
export declare class WalletService {
    private readonly connection;
    private readonly configService;
    private readonly paymentService;
    private readonly notificationService;
    private readonly logger;
    private readonly walletRepo;
    private readonly walletTransactionRepo;
    constructor(connection: DataSource, configService: ConfigService, paymentService: PaymentService, notificationService: NotificationService);
    getWallet(userId: string): Promise<WalletEntity>;
    creditWallet(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletTransactionEntity>;
    debitWallet(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletTransactionEntity>;
    debitWalletWithLock(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletTransactionEntity>;
    checkNegativeBalanceRisk(userId: string, amount: number): Promise<boolean>;
    compensateUser(userId: string, amount: number, reason: string): Promise<WalletTransactionEntity>;
    processCODPayment(orderId: string, amount: string | number, userId: string): Promise<boolean>;
    confirmCODCollection(orderId: string, amount: string | number, userId: string): Promise<WalletTransactionEntity>;
    refundCOD(orderId: string, amount: string | number, userId: string, reason: string): Promise<WalletTransactionEntity>;
    getWalletTransactions(userId: string, limit?: number, offset?: number): Promise<WalletTransactionEntity[]>;
    getWalletBalance(userId: string): Promise<{
        balance: number;
        currency: string;
    }>;
    preventDoublePayment(userId: string, orderId: string, amount: number): Promise<boolean>;
    reconcilePayments(): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        discrepancies: Array<{
            orderId: string;
            expected: number;
            actual: number;
        }>;
    }>;
}
