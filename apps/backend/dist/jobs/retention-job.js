"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RetentionJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const compliance_service_1 = require("../compliance/compliance.service");
const data_privacy_service_1 = require("../services/privacy/data-privacy.service");
const deletion_request_entity_1 = require("../db/entities/deletion-request.entity");
let RetentionJob = RetentionJob_1 = class RetentionJob {
    complianceService;
    dataPrivacyService;
    dataSource;
    logger = new common_1.Logger(RetentionJob_1.name);
    constructor(complianceService, dataPrivacyService, dataSource) {
        this.complianceService = complianceService;
        this.dataPrivacyService = dataPrivacyService;
        this.dataSource = dataSource;
    }
    async handleDailyRetention() {
        this.logger.log('Starting daily data retention job');
        try {
            await this.complianceService.applyDataRetentionPolicies();
            await this.autoProcessDeletionRequests();
            this.logger.log('Daily retention job completed');
        }
        catch (error) {
            this.logger.error('Daily retention job failed', error);
        }
    }
    async autoProcessDeletionRequests() {
        const now = new Date();
        const deletionRepo = this.dataSource.getRepository(deletion_request_entity_1.DeletionRequestEntity);
        const expiredDeletions = await deletionRepo.find({
            where: {
                status: 'pending',
                scheduledDeletionDate: (0, typeorm_1.LessThan)(now),
            },
        });
        const updatePromises = expiredDeletions.map((request) => deletionRepo.update(request.id, { status: 'approaching' }).then(() => {
            this.logger.log(`Deletion request ${request.id} approaching retention stage for user ${request.userId}`);
        }).catch((error) => {
            this.logger.error(`Failed to update deletion request ${request.id}: ${error.message}`);
        }));
        await Promise.all(updatePromises);
    }
};
exports.RetentionJob = RetentionJob;
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RetentionJob.prototype, "handleDailyRetention", null);
exports.RetentionJob = RetentionJob = RetentionJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService,
        data_privacy_service_1.DataPrivacyService,
        typeorm_1.DataSource])
], RetentionJob);
//# sourceMappingURL=retention-job.js.map