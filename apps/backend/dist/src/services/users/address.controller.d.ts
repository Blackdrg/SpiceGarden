import { AddressService } from './address.service';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
    getAddresses(req: any): unknown;
    addAddress(req: any, data: any): unknown;
    setDefault(req: any, addressId: string): unknown;
    deleteAddress(req: any, addressId: string): unknown;
}
