"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let ComplianceService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ComplianceService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ComplianceService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userRepo;
        sessionRepo;
        auditLogRepo;
        logger = new common_1.Logger(ComplianceService.name);
        constructor(userRepo, sessionRepo, auditLogRepo) {
            this.userRepo = userRepo;
            this.sessionRepo = sessionRepo;
            this.auditLogRepo = auditLogRepo;
        }
        /**
         * GDPR-compliant data retention policy
         * - User data: retained for 7 years after account deletion (legal requirement)
         * - Order data: retained for 10 years (tax/legal requirements)
         * - Session data: retained for 90 days after expiration
         * - Audit logs: retained for 3 years (security/compliance)
         */
        async applyDataRetentionPolicies() {
            try {
                this.logger.log('Starting GDPR data retention policy application');
                const now = new Date();
                // 1. Delete expired sessions (90 days after expiration)
                const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                const deletedSessions = await this.sessionRepo.delete({
                    expiresAt: (0, typeorm_1.LessThan)(sessionCutoff),
                });
                this.logger.log(`Deleted ${deletedSessions.affected || 0} expired sessions`);
                // 2. Anonymize old audit logs (beyond 3 years) to cold storage would be done here
                const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
                const oldAuditCount = await this.auditLogRepo.count({
                    where: { timestamp: (0, typeorm_1.LessThan)(auditCutoff) },
                });
                this.logger.log(`Found ${oldAuditCount} audit logs for archival`);
                this.logger.log('GDPR data retention policy application completed');
            }
            catch (error) {
                this.logger.error('Error applying data retention policies', error);
                throw error;
            }
        }
        /**
         * Check if user data should be retained based on GDPR
         * @param userId The user ID to check
         * @returns boolean indicating if data should be retained
         */
        async shouldRetainUserData(userId) {
            const user = await this.userRepo.findOne({
                where: { id: userId },
                select: ['deletedAt'],
            });
            if (!user || !user.deletedAt) {
                return true; // Active user, retain data
            }
            // Retain for 7 years after deletion (legal requirement)
            const retentionPeriodMs = 7 * 365 * 24 * 60 * 60 * 1000;
            const cutoffDate = new Date(user.deletedAt.getTime() + retentionPeriodMs);
            return new Date() < cutoffDate;
        }
        /**
         * Delete user data (GDPR right to be forgotten)
         * @param userId The user ID to delete
         */
        async deleteUserData(userId) {
            await this.userRepo.softDelete(userId);
            await this.sessionRepo.update({ userId }, { isActive: false });
            this.logger.log(`Deleted user data for user ${userId}`);
        }
        /**
         * Export user data (GDPR right to access)
         * @param userId The user ID to export
         */
        async exportUserData(userId) {
            const user = await this.userRepo.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const orders = []; // In production, fetch from order repository
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
            };
        }
        /**
         * Get data retention statistics
         */
        async getRetentionStatistics() {
            const now = new Date();
            const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
            const [totalUsers, totalSessions, expiredSessions, oldAuditLogs] = await Promise.all([
                this.userRepo.count(),
                this.sessionRepo.count(),
                this.sessionRepo.count({ where: { expiresAt: (0, typeorm_1.LessThan)(sessionCutoff) } }),
                this.auditLogRepo.count({ where: { timestamp: (0, typeorm_1.LessThan)(auditCutoff) } }),
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
                },
            };
        }
    };
    return ComplianceService = _classThis;
})();
exports.ComplianceService = ComplianceService;
