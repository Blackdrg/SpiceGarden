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
exports.PaymentMethodsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_method_entity_1 = require("../../db/entities/payment-method.entity");
let PaymentMethodsService = class PaymentMethodsService {
    paymentRepo;
    constructor(paymentRepo) {
        this.paymentRepo = paymentRepo;
    }
    async getUserPaymentMethods(userId) {
        return this.paymentRepo.find({ where: { userId } });
    }
    async addPaymentMethod(userId, data) {
        const paymentData = data;
        if (paymentData.isDefault) {
            await this.paymentRepo.update({ userId }, { isDefault: false });
        }
        const payment = this.paymentRepo.create({ ...paymentData, userId });
        return this.paymentRepo.save(payment);
    }
    async setDefault(userId, paymentId) {
        await this.paymentRepo.update({ userId }, { isDefault: false });
        return this.paymentRepo.update({ userId, id: paymentId }, { isDefault: true });
    }
    async deletePaymentMethod(userId, paymentId) {
        return this.paymentRepo.delete({ userId, id: paymentId });
    }
};
exports.PaymentMethodsService = PaymentMethodsService;
exports.PaymentMethodsService = PaymentMethodsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_method_entity_1.PaymentMethodEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentMethodsService);
//# sourceMappingURL=payment-methods.service.js.map