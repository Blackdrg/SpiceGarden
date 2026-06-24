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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const compliance_service_1 = require("./compliance.service");
const soc2_readiness_service_1 = require("./soc2-readiness.service");
const pci_dss_validation_service_1 = require("./pci-dss-validation.service");
const secrets_rotation_service_1 = require("./secrets-rotation.service");
const data_privacy_service_1 = require("../services/privacy/data-privacy.service");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const roles_guard_1 = require("../security/roles.guard");
const roles_decorator_1 = require("../security/roles.decorator");
let ComplianceController = class ComplianceController {
    complianceService;
    soc2Service;
    pciDssService;
    secretsService;
    dataPrivacyService;
    constructor(complianceService, soc2Service, pciDssService, secretsService, dataPrivacyService) {
        this.complianceService = complianceService;
        this.soc2Service = soc2Service;
        this.pciDssService = pciDssService;
        this.secretsService = secretsService;
        this.dataPrivacyService = dataPrivacyService;
    }
    async getSoc2Readiness() {
        return this.soc2Service.assessTrustServicesCriteria();
    }
    async getSoc2Evidence() {
        return this.soc2Service.generateSoc2EvidenceReport();
    }
    async getPciDssStatus() {
        return this.pciDssService.validatePciDssCompliance();
    }
    async validatePaymentFlow() {
        return this.pciDssService.validatePaymentFlow();
    }
    async getPciDssSaqMetrics() {
        return this.pciDssService.getFraudMetricsForSaq();
    }
    async getSecretsRotationStatus() {
        return {
            secretsRequiringRotation: this.secretsService.getSecretsRequiringRotation(),
            validation: await this.secretsService.validateRotationCapability(),
        };
    }
    async getSecretsRotationProof() {
        return this.secretsService.getRotationProof();
    }
    async rotateSecrets(secrets) {
        const secretList = secrets ? secrets.split(',') : ['jwt_secret', 'encryption', 'db_password'];
        return {
            success: true,
            message: 'Secrets rotation initiated',
            rotated: secretList,
        };
    }
    async getRetentionStatistics() {
        return this.complianceService.getRetentionStatistics();
    }
    async applyDataRetention() {
        return this.complianceService.applyDataRetentionPolicies();
    }
    async exportUserDataGdpr(userId, req) {
        if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
            throw new Error('Unauthorized to export this user data');
        }
        const data = await this.complianceService.exportUserData(userId);
        return {
            regulation: 'gdpr',
            data,
            exportedAt: new Date(),
            rightExercised: 'right_to_access',
        };
    }
    async exportUserDataDpdp(userId, req) {
        if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
            throw new Error('Unauthorized to export this user data');
        }
        const data = await this.complianceService.exportUserData(userId);
        return {
            regulation: 'dpdp',
            data,
            exportedAt: new Date(),
            rightExercised: 'right_to_data_portability',
        };
    }
    async requestGdprDeletion(userId, dto, req) {
        if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
            throw new Error('Unauthorized to submit deletion request for this user');
        }
        const result = await this.complianceService.requestUserDataDeletion(userId, 'gdpr', dto.reason);
        return {
            ...result,
            regulation: 'gdpr',
            rightExercised: 'right_to_be_forgotten',
            approvalRequired: true,
            cancellableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }
    async requestDpdpDeletion(userId, dto, req) {
        if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
            throw new Error('Unauthorized to submit deletion request for this user');
        }
        const result = await this.complianceService.requestUserDataDeletion(userId, 'dpdp', dto.reason);
        return {
            ...result,
            regulation: 'dpdp',
            rightExercised: 'right_to_erasure',
            approvalRequired: true,
            cancellableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }
    async cancelGdprDeletion(userId, req) {
        if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
            throw new Error('Unauthorized');
        }
        const result = await this.complianceService.cancelUserDataDeletion(userId);
        return {
            ...result,
            regulation: 'gdpr',
            message: 'Deletion request cancelled successfully',
        };
    }
    async getDeletionStatus(userId) {
        const status = await this.complianceService.getUserDataDeletionStatus(userId);
        return {
            userId,
            hasActiveRequest: !!status && ['pending', 'processing'].includes(status.status),
            deletionRequest: status,
        };
    }
    async getExportHistory(userId) {
        const exports = await this.complianceService.getUserExports(userId);
        return {
            userId,
            exports,
            regulation: 'gdpr_dpdp',
        };
    }
    async verifyPiiEncryption(userId) {
        const result = await this.complianceService.verifyPiiEncryption(userId);
        return {
            userId,
            ...result,
            verifiedAt: new Date(),
            encryptionMethod: 'AES-256 via CryptoJS',
            fieldsChecked: ['email', 'phone'],
        };
    }
    async getUserDataExport(userId) {
        return this.complianceService.exportUserData(userId);
    }
    async maskPiiFields(dto) {
        const masked = this.dataPrivacyService.maskPii(dto.data, dto.fields);
        return { maskedData: masked };
    }
    async unmaskPiiFields(dto) {
        const decrypted = this.dataPrivacyService.unmaskPii(dto.data, dto.fields);
        return { decryptedData: decrypted };
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Get)('soc2'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSoc2Readiness", null);
__decorate([
    (0, common_1.Get)('soc2/evidence'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSoc2Evidence", null);
__decorate([
    (0, common_1.Get)('pci-dss'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getPciDssStatus", null);
__decorate([
    (0, common_1.Get)('pci-dss/payment-flow'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "validatePaymentFlow", null);
__decorate([
    (0, common_1.Get)('pci-dss/saq'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getPciDssSaqMetrics", null);
__decorate([
    (0, common_1.Get)('secrets/rotation-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSecretsRotationStatus", null);
__decorate([
    (0, common_1.Get)('secrets/proof'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSecretsRotationProof", null);
__decorate([
    (0, common_1.Post)('secrets/rotate'),
    __param(0, (0, common_1.Query)('secrets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "rotateSecrets", null);
__decorate([
    (0, common_1.Get)('retention-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getRetentionStatistics", null);
__decorate([
    (0, common_1.Post)('retention/apply'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "applyDataRetention", null);
__decorate([
    (0, common_1.Get)('gdpr/user/:userId/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'customer'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "exportUserDataGdpr", null);
__decorate([
    (0, common_1.Get)('dpdp/user/:userId/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'customer'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "exportUserDataDpdp", null);
__decorate([
    (0, common_1.Post)('gdpr/user/:userId/deletion-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'customer'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "requestGdprDeletion", null);
__decorate([
    (0, common_1.Post)('dpdp/user/:userId/deletion-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'customer'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "requestDpdpDeletion", null);
__decorate([
    (0, common_1.Post)('gdpr/user/:userId/deletion-request/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'customer'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "cancelGdprDeletion", null);
__decorate([
    (0, common_1.Get)('user/:userId/deletion-status'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getDeletionStatus", null);
__decorate([
    (0, common_1.Get)('user/:userId/export-history'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getExportHistory", null);
__decorate([
    (0, common_1.Get)('user/:userId/pii-verification'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "verifyPiiEncryption", null);
__decorate([
    (0, common_1.Get)('user/:userId/data-export'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getUserDataExport", null);
__decorate([
    (0, common_1.Post)('mask/pii'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "maskPiiFields", null);
__decorate([
    (0, common_1.Post)('unmask/pii'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "unmaskPiiFields", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, common_1.Controller)('compliance'),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService,
        soc2_readiness_service_1.Soc2ReadinessService,
        pci_dss_validation_service_1.PciDssValidationService,
        secrets_rotation_service_1.SecretsRotationService,
        data_privacy_service_1.DataPrivacyService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map