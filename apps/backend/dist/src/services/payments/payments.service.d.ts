import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AuditService } from '../../audit/audit.service';
import { LedgerService } from '../../modules/ledger/ledger.service';
import { PaymentGatewayFactory } from './gateway-factory.service';
import { Request } from 'express';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from './payment.types';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
export declare class PaymentService {
    private configService;
    private auditService;
    private ledgerService;
    private gatewayFactory;
    private readonly walletRepo;
    private readonly transactionRepo;
    private readonly logger;
    constructor(configService: ConfigService, auditService: AuditService, ledgerService: LedgerService, gatewayFactory: PaymentGatewayFactory, walletRepo: Repository<WalletEntity>, transactionRepo: Repository<WalletTransactionEntity>);
    createPaymentIntent(amount: number, currency?: string, userId?: string | null, metadata?: Record<string, any>, request?: Request, gatewayName?: string): Promise<PaymentIntent>;
    private validatePaymentLimits;
    private checkSuspiciousPatterns;
    confirmPayment(paymentId: string, userId: string, request?: Request, gatewayName?: string): Promise<PaymentResult>;
    refundPayment(paymentId: string, amount: number | null | undefined, userId: string, reason?: string, request?: Request, gatewayName?: string): Promise<RefundResult>;
    constructEvent(payload: Buffer, signature: string, secret: string, gatewayName?: string): Promise<GatewayEvent>;
}
