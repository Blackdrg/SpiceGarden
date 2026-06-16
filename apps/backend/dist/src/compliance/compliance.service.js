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
var ComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../db/entities/user.entity");
const session_entity_1 = require("../db/entities/session.entity");
const audit_log_entity_1 = require("../db/entities/audit-log.entity");
const order_entity_1 = require("../db/entities/order.entity");
const deletion_request_entity_1 = require("../db/entities/deletion-request.entity");
const data_export_request_entity_1 = require("../db/entities/data-export-request.entity");
let ComplianceService = ComplianceService_1 = class ComplianceService {
    userRepo;
    sessionRepo;
    auditLogRepo;
    orderRepo;
    deletionRequestRepo;
    dataExportRequestRepo;
    logger = new common_1.Logger(ComplianceService_1.name);
    constructor(userRepo, sessionRepo, auditLogRepo, orderRepo, deletionRequestRepo, dataExportRequestRepo) {
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
        this.auditLogRepo = auditLogRepo;
        this.orderRepo = orderRepo;
        this.deletionRequestRepo = deletionRequestRepo;
        this.dataExportRequestRepo = dataExportRequestRepo;
    }
    async applyDataRetentionPolicies() {
        try {
            this.logger.log('Starting GDPR data retention policy application');
            const now = new Date();
            const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            const deletedSessions = await this.sessionRepo.delete({
                expiresAt: (0, typeorm_2.LessThan)(sessionCutoff),
            });
            this.logger.log(`Deleted ${deletedSessions.affected || 0} expired sessions`);
            const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
            const oldAuditCount = await this.auditLogRepo.count({
                where: { timestamp: (0, typeorm_2.LessThan)(auditCutoff) },
            });
            this.logger.log(`Found ${oldAuditCount} audit logs for archival`);
            this.logger.log('GDPR data retention policy application completed');
            return { deletedSessions: deletedSessions.affected || 0, oldAuditLogs: oldAuditCount };
        }
        catch (error) {
            this.logger.error('Error applying data retention policies', error);
            throw error;
        }
    }
    async shouldRetainUserData(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: { deletedAt: true },
        });
        if (!user || !user.deletedAt) {
            return true;
        }
        const retentionPeriodMs = 7 * 365 * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(user.deletedAt.getTime() + retentionPeriodMs);
        return new Date() < cutoffDate;
    }
    async deleteUserData(userId) {
        await this.userRepo.softDelete(userId);
        await this.sessionRepo.update({ userId }, { isActive: false });
        this.logger.log(`Deleted user data for user ${userId}`);
    }
    async exportUserData(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const orders = await this.orderRepo.find({
            where: { userId },
        });
        const sessions = await this.sessionRepo.find({
            where: { userId },
        });
        const auditLogs = await this.auditLogRepo.find({
            where: { performedBy: userId },
            take: 1000,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                createdAt: user.createdAt,
            },
            orders,
            sessions: sessions.map(s => ({
                deviceName: s.deviceName,
                deviceType: s.deviceType,
                createdAt: s.createdAt,
            })),
            auditLogs: auditLogs.map(l => ({
                action: l.action,
                timestamp: l.timestamp,
            })),
            exportedAt: new Date(),
            regulation: 'gdpr',
        };
    }
    async getRetentionStatistics() {
        const now = new Date();
        const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
        const [totalUsers, totalSessions, expiredSessions, oldAuditLogs, pendingDeletionRequests] = await Promise.all([
            this.userRepo.count(),
            this.sessionRepo.count(),
            this.sessionRepo.count({ where: { expiresAt: (0, typeorm_2.LessThan)(sessionCutoff) } }),
            this.auditLogRepo.count({ where: { timestamp: (0, typeorm_2.LessThan)(auditCutoff) } }),
            this.deletionRequestRepo.count({ where: { status: 'pending' } }),
        ]);
        return {
            retentionPolicies: {
                sessionRetentionDays: 90,
                auditLogRetentionYears: 3,
                userDataRetentionYears: 7,
                orderRetentionYears: 10,
            },
            statistics: {
                totalUsers,
                totalSessions,
                expiredSessions,
                oldAuditLogs,
                pendingDeletionRequests,
            },
        };
    }
    async requestUserDataDeletion(userId, regulation, reason) {
        const existingRequest = await this.deletionRequestRepo.findOne({
            where: { userId, status: 'pending' },
        });
        if (existingRequest) {
            throw new common_1.ConflictException('User already has a pending deletion request');
        }
        const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const request = this.deletionRequestRepo.create({
            userId,
            regulation,
            reason,
            scheduledDeletionDate: scheduledDate,
            status: 'pending',
        });
        const saved = await this.deletionRequestRepo.save(request);
        this.logger.log(`Created ${regulation} deletion request for user ${userId}`);
        return {
            requestId: saved.id,
            regulation: saved.regulation,
            status: saved.status,
            message: 'Deletion request submitted successfully',
        };
    }
    async cancelUserDataDeletion(userId) {
        const request = await this.deletionRequestRepo.findOne({
            where: { userId, status: 'pending' },
        });
        if (!request) {
            return {
                success: false,
                message: 'No pending deletion request found',
            };
        }
        await this.deletionRequestRepo.update(request.id, {
            status: 'cancelled',
            cancellationReason: 'User requested cancellation',
        });
        this.logger.log(`Cancelled deletion request for user ${userId}`);
        return {
            success: true,
            message: 'Deletion request cancelled',
        };
    }
    async getUserDataDeletionStatus(userId) {
        const request = await this.deletionRequestRepo.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        if (!request) {
            return null;
        }
        return {
            status: request.status,
            scheduledDeletionDate: request.scheduledDeletionDate,
            regulation: request.regulation,
        };
    }
    async getUserExports(userId) {
        const exports = await this.dataExportRequestRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        return exports.map(e => ({
            id: e.id,
            status: e.status,
            createdAt: e.createdAt,
            completedAt: e.completedAt,
            exportFormat: e.exportFormat,
            regulation: e.regulation,
        }));
    }
    async verifyPiiEncryption(userId) {
        const piiFields = ['email', 'phone', 'fullName'];
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const fieldsStatus = {};
        const encryptedFields = [];
        for (const field of piiFields) {
            const value = user[field];
            if (typeof value === 'string' && value.startsWith('U2FsdGVkX1+')) {
                fieldsStatus[field] = 'encrypted';
                encryptedFields.push(field);
            }
            else if (typeof value === 'string') {
                fieldsStatus[field] = 'plaintext_warning';
            }
            else {
                fieldsStatus[field] = 'missing';
            }
        }
        return {
            encryptedFields,
            fieldsStatus,
            isEncrypted: encryptedFields.length === piiFields.length,
            verified: encryptedFields.length === piiFields.length,
        };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = ComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(deletion_request_entity_1.DeletionRequestEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(data_export_request_entity_1.DataExportRequestEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ComplianceService);
