import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';
export declare class AddressService {
    private readonly addressRepo;
    constructor(addressRepo: Repository<AddressEntity>);
    getUserAddresses(userId: string): Promise<any>;
    addAddress(userId: string, data: Partial<AddressEntity> & {
        isDefault?: boolean;
    }): Promise<any>;
    setDefault(userId: string, addressId: string): Promise<any>;
    deleteAddress(userId: string, addressId: string): Promise<{
        deleted: boolean;
    }>;
}
