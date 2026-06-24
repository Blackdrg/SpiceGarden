import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';
export declare class UserProfileService {
    private readonly addressRepo;
    private readonly paymentMethodRepo;
    constructor(addressRepo: Repository<AddressEntity>, paymentMethodRepo: Repository<PaymentMethodEntity>);
    getAddresses(userId: string): Promise<AddressEntity[]>;
    createAddress(userId: string, data: {
        label: string;
        addressLine: string;
        city: string;
        state: string;
        postalCode: string;
        location: {
            lat: number;
            lng: number;
        };
        isDefault?: boolean;
    }): Promise<AddressEntity>;
    updateAddress(userId: string, id: string, data: Partial<{
        label: string;
        addressLine: string;
        city: string;
        state: string;
        postalCode: string;
        location: {
            lat: number;
            lng: number;
        };
        isDefault: boolean;
    }>): Promise<AddressEntity>;
    deleteAddress(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getPaymentMethods(userId: string): Promise<PaymentMethodEntity[]>;
    createPaymentMethod(userId: string, data: {
        type: 'card' | 'upi' | 'wallet';
        cardLast4?: string;
        cardBrand?: string;
        cardExpiry?: string;
        upiId?: string;
        walletProvider?: string;
        externalPaymentMethodId?: string;
        isDefault?: boolean;
    }): Promise<PaymentMethodEntity>;
    deletePaymentMethod(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    setDefaultPaymentMethod(userId: string, id: string): Promise<PaymentMethodEntity>;
    validatePaymentMethodOwnership(userId: string, paymentMethodId: string): Promise<PaymentMethodEntity>;
}
