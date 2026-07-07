import { UserEntity } from './user.entity';
export declare class DeletionRequestEntity {
    id: string;
    status: string;
    regulation: string;
    reason: string;
    scheduledDeletionDate: Date;
    cancellationReason: string;
    createdAt: Date;
    completedAt: Date;
    user: UserEntity;
    userId: string;
}
