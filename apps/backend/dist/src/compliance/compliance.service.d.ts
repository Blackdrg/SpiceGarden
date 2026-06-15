import { Repository } from 'typeorm';
import { UserEntity } from '../db/entities/user.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { OrderEntity } from '../db/entities/order.entity';
import { DeletionRequestEntity } from '../db/entities/deletion-request.entity';
import { DataExportRequestEntity } from '../db/entities/data-export-request.entity';
export declare class ComplianceService {
    private readonly userRepo;
    private readonly sessionRepo;
    private readonly auditLogRepo;
    private readonly orderRepo;
    private readonly deletionRequestRepo;
    private readonly dataExportRequestRepo;
    private readonly logger;
    constructor(userRepo: Repository<UserEntity>, sessionRepo: Repository<SessionEntity>, auditLogRepo: Repository<AuditLogEntity>, orderRepo: Repository<OrderEntity>, deletionRequestRepo: Repository<DeletionRequestEntity>, dataExportRequestRepo: Repository<DataExportRequestEntity>);
    applyDataRetentionPolicies(): Promise<{
        deletedSessions: number;
        oldAuditLogs: number;
    }>;
    shouldRetainUserData(userId: string): Promise<boolean>;
    deleteUserData(userId: string): Promise<void>;
    exportUserData(userId: string): Promise<any>;
    getRetentionStatistics(): Promise<any>;
    requestUserDataDeletion(userId: string, regulation: string, reason?: string): Promise<any>;
    cancelUserDataDeletion(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserDataDeletionStatus(userId: string): Promise<null | {
        status: string;
        scheduledDeletionDate: Date;
        regulation: string;
    }>;
    getUserExports(userId: string): Promise<any[]>;
    verifyPiiEncryption(userId: string): Promise<any>;
}
