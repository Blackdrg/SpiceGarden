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
    getAddresses(req: any): unknown;
    createAddress(req: any, body: AddressCreateBody): unknown;
    updateAddress(req: any, id: string, body: Partial<AddressCreateBody>): unknown;
    deleteAddress(req: any, id: string): unknown;
    getPaymentMethods(req: any): unknown;
    createPaymentMethod(req: any, body: PaymentMethodCreateBody): unknown;
    deletePaymentMethod(req: any, id: string): unknown;
    setDefaultPaymentMethod(req: any, id: string): unknown;
}
export {};
