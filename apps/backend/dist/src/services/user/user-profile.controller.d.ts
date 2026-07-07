import { UserProfileService } from './user-profile.service';
interface AddressCreateBody {
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
}
interface PaymentMethodCreateBody {
    type: 'card' | 'upi' | 'wallet';
    cardLast4?: string;
    cardBrand?: string;
    cardExpiry?: string;
    upiId?: string;
    walletProvider?: string;
    externalPaymentMethodId?: string;
    isDefault?: boolean;
}
export declare class UserProfileController {
    private readonly profileService;
    constructor(profileService: UserProfileService);
    getAddresses(req: any): Promise<import("../../db/entities/address.entity").AddressEntity[]>;
    createAddress(req: any, body: AddressCreateBody): Promise<any>;
    updateAddress(req: any, id: string, body: Partial<AddressCreateBody>): Promise<import("../../db/entities/address.entity").AddressEntity>;
    deleteAddress(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getPaymentMethods(req: any): Promise<import("../../db/entities/payment-method.entity").PaymentMethodEntity[]>;
    createPaymentMethod(req: any, body: PaymentMethodCreateBody): Promise<import("../../db/entities/payment-method.entity").PaymentMethodEntity>;
    deletePaymentMethod(req: any, id: string): Promise<{
        success: boolean;
    }>;
    setDefaultPaymentMethod(req: any, id: string): Promise<import("../../db/entities/payment-method.entity").PaymentMethodEntity>;
}
export {};
