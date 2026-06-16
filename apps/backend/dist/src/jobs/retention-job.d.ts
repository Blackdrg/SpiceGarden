import { DataSource } from 'typeorm';
import { ComplianceService } from '../compliance/compliance.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
export declare class RetentionJob {
    private complianceService;
    private dataPrivacyService;
    private dataSource;
    private readonly logger;
    constructor(complianceService: ComplianceService, dataPrivacyService: DataPrivacyService, dataSource: DataSource);
    handleDailyRetention(): Promise<void>;
    private autoProcessDeletionRequests;
}
