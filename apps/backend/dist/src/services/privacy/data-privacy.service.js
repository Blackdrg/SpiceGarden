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
var DataPrivacyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPrivacyService = void 0;
const common_1 = require("@nestjs/common");
const encryption_service_1 = require("../../security/encryption.service");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const data_export_request_entity_1 = require("../../db/entities/data-export-request.entity");
const deletion_request_entity_1 = require("../../db/entities/deletion-request.entity");
let DataPrivacyService = DataPrivacyService_1 = class DataPrivacyService {
    constructor(encryptionService, dataSource) {
        this.encryptionService = encryptionService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DataPrivacyService_1.name);
    }
    async getUserData(userId) {
        const user = this.dataSource.getRepository(user_entity_1.UserEntity).findOne({ where: { id: userId } });
        const orders = this.dataSource.getRepository(order_entity_1.OrderEntity).find({ where: { userId }, order: { createdAt: 'DESC' }, take: 1000 });
        const sessions = this.dataSource.getRepository(order_entity_1.OrderEntity).find({ where: { userId } });
        const auditLogs = this.dataSource.getRepository(order_entity_1.OrderEntity).find({ where: { userId }, order: { createdAt: 'DESC' }, take: 1000 });
        const [u, o, s, a] = await Promise.all([user, orders, sessions, auditLogs]);
        return {
            user: {
                id: u?.id,
                fullName: u?.fullName,
                email: u?.email,
                phone: u?.phone,
                createdAt: u?.createdAt,
                updatedAt: u?.updatedAt,
                deletedAt: u?.deletedAt,
            },
            orders: (o ?? []).map((ord) => ({
                id: ord.id,
                status: ord.status,
                paymentStatus: ord.paymentStatus,
                grandTotal: ord.grandTotal,
                createdAt: ord.createdAt,
                restaurantId: ord.restaurantId,
                branchId: ord.branchId,
                items: (ord.items ?? []).map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            })),
            sessions: (s ?? []).map((sess) => ({
                id: sess.id,
                createdAt: sess.createdAt,
                expiresAt: sess.expiresAt,
            })),
            auditLogs: (a ?? []).map((log) => ({
                id: log.id,
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId,
                createdAt: log.timestamp,
                metadata: log.metadata,
            })),
        };
    }
    maskPii(obj, fields) {
        const masked = { ...obj };
        for (const field of fields) {
            const key = String(field);
            if (key in masked && typeof masked[key] === 'string' && masked[key]) {
                masked[key] = this.encryptionService.encrypt(masked[key]);
            }
        }
        return masked;
    }
    unmaskPii(obj, fields) {
        const decrypted = { ...obj };
        for (const field of fields) {
            const key = String(field);
            if (key in decrypted && typeof decrypted[key] === 'string' && decrypted[key]) {
                try {
                    decrypted[key] = this.encryptionService.decrypt(decrypted[key]);
                }
                catch (error) {
                    this.logger.warn(`Failed to decrypt field ${key}: ${error.message}`);
                }
            }
        }
        return decrypted;
    }
    async processProtectedDeletion(userId) {
        const result = await this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(user_entity_1.UserEntity);
            const orderRepo = manager.getRepository(order_entity_1.OrderEntity);
            const exportRepo = manager.getRepository(data_export_request_entity_1.DataExportRequestEntity);
            const deletionRepo = manager.getRepository(deletion_request_entity_1.DeletionRequestEntity);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user)
                throw new Error('User not found');
            const exportRequests = await exportRepo.find({ where: { userId, status: 'completed' } });
            const deletionRequest = await deletionRepo.findOne({ where: { userId, status: 'pending' } });
            if (!deletionRequest)
                throw new Error('Active deletion request not found');
            if (exportRequests.length === 0) {
                const exportData = await this.getUserData(userId);
                await this.maskPii(exportData, ['user.email', 'user.phone', 'user.fullName']);
            }
            await deletionRepo.update(deletionRequest.id, { status: 'processing' });
            await Promise.all([
                orderRepo.update({ userId }, { status: 'cancelled' }),
                userRepo.update(userId, { status: 'deleted' }),
            ]);
            await deletionRepo.update(deletionRequest.id, { status: 'completed', completedAt: new Date() });
        });
        this.logger.log(`Completed protected deletion for user ${userId}`);
        return result;
    }
};
exports.DataPrivacyService = DataPrivacyService;
exports.DataPrivacyService = DataPrivacyService = DataPrivacyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [encryption_service_1.EncryptionService,
        typeorm_1.DataSource])
], DataPrivacyService);
//# sourceMappingURL=data-privacy.service.js.map