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
var OrderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessor = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const notification_service_1 = require("../../services/notifications/notification.service");
let OrderProcessor = OrderProcessor_1 = class OrderProcessor {
    orderRepo;
    notificationService;
    logger = new common_1.Logger(OrderProcessor_1.name);
    constructor(orderRepo, notificationService) {
        this.orderRepo = orderRepo;
        this.notificationService = notificationService;
    }
    async processOrderLifecycle(data, job) {
        const { orderId, status, userId } = data;
        if (!orderId || !status) {
            throw new Error('Order lifecycle job requires orderId and status');
        }
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.status !== status) {
            order.status = status;
            order.updatedAt = new Date();
            await this.orderRepo.save(order);
        }
        if (userId) {
            await this.notificationService.notifyOrderUpdate(userId, orderId, status);
        }
        this.logger.log(`Processed order lifecycle job ${job?.id ?? orderId}: ${status}`);
    }
};
exports.OrderProcessor = OrderProcessor;
exports.OrderProcessor = OrderProcessor = OrderProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_service_1.NotificationService])
], OrderProcessor);
//# sourceMappingURL=order.processor.js.map