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
exports.LoadTestOrderController = void 0;
const common_1 = require("@nestjs/common");
let LoadTestOrderController = class LoadTestOrderController {
    async healthCheck() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    async placeOrder(body) {
        return {
            id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            ...body,
            status: 'PLACED',
            paymentStatus: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
};
exports.LoadTestOrderController = LoadTestOrderController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoadTestOrderController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoadTestOrderController.prototype, "placeOrder", null);
exports.LoadTestOrderController = LoadTestOrderController = __decorate([
    (0, common_1.Controller)('orders')
], LoadTestOrderController);
