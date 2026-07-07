import { WalletEntity } from './wallet.entity';
export declare class WalletTransactionEntity {
    id: string;
    walletId: string;
    wallet: WalletEntity;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    referenceId: string;
    createdAt: Date;
}
