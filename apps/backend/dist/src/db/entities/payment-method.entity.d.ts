import { UserEntity } from './user.entity';
export declare class PaymentMethodEntity {
    id: string;
    userId: string;
    user: UserEntity;
    type: string;
    cardLast4: string;
    cardBrand: string;
    cardExpiry: string;
    upiId: string;
    walletProvider: string;
    externalPaymentMethodId: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
