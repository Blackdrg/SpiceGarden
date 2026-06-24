import { EncryptionService } from '../../security/encryption.service';
import { DataSource } from 'typeorm';
export interface UserDataExport {
    user: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
    };
    orders: any[];
    sessions: any[];
    auditLogs: any[];
    exportedAt: Date;
    regulation: string;
}
export interface DeletionVerificationInput {
    fullName: string;
    email: string;
    phone: string;
}
export declare class DataPrivacyService {
    private encryptionService;
    private dataSource;
    private readonly logger;
    constructor(encryptionService: EncryptionService, dataSource: DataSource);
    getUserData(userId: string): Promise<any>;
    maskPii<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T;
    unmaskPii<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T;
    processProtectedDeletion(userId: string): Promise<void>;
}
