import { UserEntity } from './user.entity';
export declare class SubscriptionEntity {
    id: string;
    userId: string;
    user: UserEntity;
    planName: string;
    status: string;
    expiryDate: Date;
    benefits: any;
    createdAt: Date;
    updatedAt: Date;
}
