import { type Request as ExpressRequest } from 'express';
import { ComplianceService } from './compliance.service';
import { Soc2ReadinessService } from './soc2-readiness.service';
import { PciDssValidationService } from './pci-dss-validation.service';
import { SecretsRotationService } from './secrets-rotation.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
import { UserRole } from '../shared/domain/user.interface';
export interface DeletionRequestDto {
    userId: string;
    regulation: 'gdpr' | 'dpdp' | 'self_service';
    reason?: string;
}
export interface CancelDeletionDto {
    userId: string;
}
export declare class ComplianceController {
    private complianceService;
    private soc2Service;
    private pciDssService;
    private secretsService;
    private dataPrivacyService;
    constructor(complianceService: ComplianceService, soc2Service: Soc2ReadinessService, pciDssService: PciDssValidationService, secretsService: SecretsRotationService, dataPrivacyService: DataPrivacyService);
    getSoc2Readiness(): Promise<import("./soc2-readiness.service").Soc2Report>;
    getSoc2Evidence(): Promise<Record<string, any>>;
    getPciDssStatus(): Promise<import("./pci-dss-validation.service").PciDssReport>;
    validatePaymentFlow(): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    getPciDssSaqMetrics(): Promise<{
        totalTransactions: number;
        fraudFlags: number;
        chargebackRate: number;
        blockedTransactions: number;
    }>;
    getSecretsRotationStatus(): Promise<{
        secretsRequiringRotation: {
            name: string;
            lastRotation?: Date;
        }[];
        validation: {
            canRotateAll: boolean;
            details: string[];
        };
    }>;
    getSecretsRotationProof(): Promise<Record<string, any>>;
    rotateSecrets(secrets?: string): Promise<{
        success: boolean;
        message: string;
        rotated: string[];
    }>;
    getRetentionStatistics(): Promise<any>;
    applyDataRetention(): Promise<{
        deletedSessions: number;
        oldAuditLogs: number;
    }>;
    exportUserDataGdpr(userId: string, req: ExpressRequest & {
        user?: {
            sub?: string;
            role?: UserRole;
        };
    }): Promise<{
        regulation: string;
        data: any;
        exportedAt: Date;
        rightExercised: string;
    }>;
    exportUserDataDpdp(userId: string, req: ExpressRequest & {
        user?: {
            sub?: string;
            role?: UserRole;
        };
    }): Promise<{
        regulation: string;
        data: any;
        exportedAt: Date;
        rightExercised: string;
    }>;
    requestGdprDeletion(userId: string, dto: DeletionRequestDto, req: ExpressRequest & {
        user?: {
            sub?: string;
            role?: UserRole;
        };
    }): Promise<any>;
    requestDpdpDeletion(userId: string, dto: DeletionRequestDto, req: ExpressRequest & {
        user?: {
            sub?: string;
            role?: UserRole;
        };
    }): Promise<any>;
    cancelGdprDeletion(userId: string, req: ExpressRequest & {
        user?: {
            sub?: string;
            role?: UserRole;
        };
    }): Promise<{
        regulation: string;
        message: string;
        success: boolean;
    }>;
    getDeletionStatus(userId: string): Promise<{
        userId: string;
        hasActiveRequest: boolean;
        deletionRequest: {
            status: string;
            scheduledDeletionDate: Date;
            regulation: string;
        } | null;
    }>;
    getExportHistory(userId: string): Promise<{
        userId: string;
        exports: any[];
        regulation: string;
    }>;
    verifyPiiEncryption(userId: string): Promise<any>;
    getUserDataExport(userId: string): Promise<any>;
    maskPiiFields(dto: {
        data: Record<string, any>;
        fields: string[];
    }): Promise<{
        maskedData: Record<string, any>;
    }>;
    unmaskPiiFields(dto: {
        data: Record<string, any>;
        fields: string[];
    }): Promise<{
        decryptedData: Record<string, any>;
    }>;
}
