import { UserEntity } from './user.entity';
export declare class WalletEntity {
    id: string;
    userId: string;
    user: UserEntity;
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
