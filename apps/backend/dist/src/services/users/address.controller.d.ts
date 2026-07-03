import { AddressService } from './address.service';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
    getAddresses(req: any): Promise<import("../../db/entities/address.entity").AddressEntity[]>;
    addAddress(req: any, data: any): Promise<import("../../db/entities/address.entity").AddressEntity>;
    setDefault(req: any, addressId: string): Promise<import("typeorm").UpdateResult>;
    deleteAddress(req: any, addressId: string): Promise<{
        deleted: boolean;
    }>;
}
