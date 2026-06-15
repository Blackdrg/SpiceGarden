import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PaymentFraudFlagEntity } from '../services/payments/payment-fraud.entity';
export interface PciDssRequirement {
    id: string;
    title: string;
    description: string;
    status: 'compliant' | 'non_compliant' | 'not_applicable' | 'partial';
    evidence?: string[];
    notes?: string;
}
export interface PciDssReport {
    assessmentDate: Date;
    overallCompliant: boolean;
    requirements: PciDssRequirement[];
    summary: {
        compliant: number;
        nonCompliant: number;
        notApplicable: number;
    };
}
export declare class PciDssValidationService {
    private configService;
    private readonly fraudFlagRepo;
    private readonly logger;
    constructor(configService: ConfigService, fraudFlagRepo: Repository<PaymentFraudFlagEntity>);
    validatePciDssCompliance(): Promise<PciDssReport>;
    private checkAllRequirements;
    validatePaymentFlow(): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    getFraudMetricsForSaq(): Promise<{
        totalTransactions: number;
        fraudFlags: number;
        chargebackRate: number;
        blockedTransactions: number;
    }>;
    getQuarterlyComplianceScan(): Promise<Record<string, any>>;
    private generateRecommendations;
}
