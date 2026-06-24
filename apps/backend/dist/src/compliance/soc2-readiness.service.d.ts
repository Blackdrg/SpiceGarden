import { ConfigService } from '@nestjs/config';
export interface Soc2Control {
    id: string;
    name: string;
    description: string;
    status: 'implemented' | 'partial' | 'not_implemented';
    evidence?: string[];
    lastChecked?: Date;
}
export interface Soc2Report {
    trustServicesCriteria: {
        security: Soc2Control[];
        availability: Soc2Control[];
        processingIntegrity: Soc2Control[];
        confidentiality: Soc2Control[];
        privacy: Soc2Control[];
    };
    overallStatus: 'compliant' | 'partially_compliant' | 'not_compliant';
    gapAnalysis: string[];
}
export declare class Soc2ReadinessService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    assessTrustServicesCriteria(): Promise<Soc2Report>;
    private assessSecurityControls;
    private assessAvailabilityControls;
    private assessProcessingIntegrityControls;
    private assessConfidentialityControls;
    private assessPrivacyControls;
    private identifyGaps;
    private calculateOverallStatus;
    generateSoc2EvidenceReport(): Promise<Record<string, any>>;
}
