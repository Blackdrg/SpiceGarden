import { UserEntity } from './user.entity';
export declare class DataExportRequestEntity {
    id: string;
    regulation: string;
    status: string;
    exportUrl: string;
    filePath: string;
    exportFormat: string;
    errorMessage: string;
    createdAt: Date;
    completedAt: Date;
    user: UserEntity;
    userId: string;
}
