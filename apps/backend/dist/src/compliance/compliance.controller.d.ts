import { ComplianceService } from './compliance.service';
import { Soc2ReadinessService } from './soc2-readiness.service';
import { PciDssValidationService } from './pci-dss-validation.service';
import { SecretsRotationService } from './secrets-rotation.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
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
    getSoc2Readiness(): unknown;
    getSoc2Evidence(): unknown;
    getPciDssStatus(): unknown;
    validatePaymentFlow(): unknown;
    getPciDssSaqMetrics(): unknown;
    getSecretsRotationStatus(): unknown;
    getSecretsRotationProof(): unknown;
    rotateSecrets(secrets?: string): unknown;
    getRetentionStatistics(): unknown;
    applyDataRetention(): unknown;
    exportUserDataGdpr(userId: string, req: any): unknown;
    exportUserDataDpdp(userId: string, req: any): unknown;
    requestGdprDeletion(userId: string, dto: DeletionRequestDto, req: any): unknown;
    requestDpdpDeletion(userId: string, dto: DeletionRequestDto, req: any): unknown;
    cancelGdprDeletion(userId: string, req: any): unknown;
    getDeletionStatus(userId: string): unknown;
    getExportHistory(userId: string): unknown;
    verifyPiiEncryption(userId: string): unknown;
    getUserDataExport(userId: string): unknown;
    maskPiiFields(dto: {
        data: Record<string, any>;
        fields: string[];
    }): unknown;
    unmaskPiiFields(dto: {
        data: Record<string, any>;
        fields: string[];
    }): unknown;
}
