import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';
export declare class AddressService {
    private readonly addressRepo;
    constructor(addressRepo: Repository<AddressEntity>);
    getUserAddresses(userId: string): unknown;
    addAddress(userId: string, data: Partial<AddressEntity> & {
        isDefault?: boolean;
    }): unknown;
    setDefault(userId: string, addressId: string): unknown;
    deleteAddress(userId: string, addressId: string): unknown;
}
