import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';
export declare class UserProfileService {
    private readonly addressRepo;
    private readonly paymentMethodRepo;
    constructor(addressRepo: Repository<AddressEntity>, paymentMethodRepo: Repository<PaymentMethodEntity>);
    getAddresses(userId: string): unknown;
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
    }): unknown;
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
    }>): unknown;
    deleteAddress(userId: string, id: string): unknown;
    getPaymentMethods(userId: string): unknown;
    createPaymentMethod(userId: string, data: {
        type: 'card' | 'upi' | 'wallet';
        cardLast4?: string;
        cardBrand?: string;
        cardExpiry?: string;
        upiId?: string;
        walletProvider?: string;
        externalPaymentMethodId?: string;
        isDefault?: boolean;
    }): unknown;
    deletePaymentMethod(userId: string, id: string): unknown;
    setDefaultPaymentMethod(userId: string, id: string): unknown;
    validatePaymentMethodOwnership(userId: string, paymentMethodId: string): unknown;
}
