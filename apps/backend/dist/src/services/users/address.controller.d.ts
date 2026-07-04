import { AddressService } from './address.service';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
    getAddresses(req: any): Promise<any>;
    addAddress(req: any, data: any): Promise<any>;
    setDefault(req: any, addressId: string): Promise<any>;
    deleteAddress(req: any, addressId: string): Promise<{
        deleted: boolean;
    }>;
}
