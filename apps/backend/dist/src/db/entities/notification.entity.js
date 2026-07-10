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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEntity = void 0;
const typeorm_1 = require("typeorm");
const notification_status_enum_1 = require("./notification-status.enum");
let NotificationEntity = class NotificationEntity {
    id;
    recipientId;
    recipientType;
    notificationType;
    payload;
    provider;
    status;
    attemptCount;
    maxAttempts;
    lastAttemptAt;
    nextAttemptAt;
    completedAt;
    errorInfo;
    callbackUrl;
    metadata;
    createdAt;
    updatedAt;
};
exports.NotificationEntity = NotificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "recipientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "recipientType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', enum: notification_status_enum_1.NotificationStatus, default: notification_status_enum_1.NotificationStatus.PENDING }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], NotificationEntity.prototype, "attemptCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], NotificationEntity.prototype, "maxAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "lastAttemptAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "nextAttemptAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "errorInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "callbackUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "updatedAt", void 0);
exports.NotificationEntity = NotificationEntity = __decorate([
    (0, typeorm_1.Entity)('notifications'),
    (0, typeorm_1.Index)('idx_notifications_recipient_id', ['recipientId']),
    (0, typeorm_1.Index)('idx_notifications_status', ['status']),
    (0, typeorm_1.Index)('idx_notifications_recipient_status', ['recipientId', 'status']),
    (0, typeorm_1.Index)('idx_notifications_next_attempt', ['nextAttemptAt']),
    (0, typeorm_1.Index)('idx_notifications_created_at', ['createdAt'])
], NotificationEntity);
