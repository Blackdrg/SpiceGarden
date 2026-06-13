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
exports.UserProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const address_entity_1 = require("../../db/entities/address.entity");
const payment_method_entity_1 = require("../../db/entities/payment-method.entity");
let UserProfileService = class UserProfileService {
    addressRepo;
    paymentMethodRepo;
    constructor(addressRepo, paymentMethodRepo) {
        this.addressRepo = addressRepo;
        this.paymentMethodRepo = paymentMethodRepo;
    }
    async getAddresses(userId) {
        return this.addressRepo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
    }
    async createAddress(userId, data) {
        if (data.isDefault) {
            await this.addressRepo.update({ userId }, { isDefault: false });
        }
        const address = this.addressRepo.create({
            userId,
            ...data,
        });
        return this.addressRepo.save(address);
    }
    async updateAddress(userId, id, data) {
        const address = await this.addressRepo.findOne({ where: { id, userId } });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (data.isDefault) {
            await this.addressRepo.update({ userId }, { isDefault: false });
        }
        Object.assign(address, data);
        return this.addressRepo.save(address);
    }
    async deleteAddress(userId, id) {
        const address = await this.addressRepo.findOne({ where: { id, userId } });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.addressRepo.delete(id);
        return { success: true };
    }
    async getPaymentMethods(userId) {
        return this.paymentMethodRepo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
    }
    async createPaymentMethod(userId, data) {
        if (data.isDefault) {
            await this.paymentMethodRepo.update({ userId }, { isDefault: false });
        }
        const paymentMethod = this.paymentMethodRepo.create({
            userId,
            ...data,
        });
        return this.paymentMethodRepo.save(paymentMethod);
    }
    async deletePaymentMethod(userId, id) {
        const paymentMethod = await this.paymentMethodRepo.findOne({ where: { id, userId } });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        await this.paymentMethodRepo.delete(id);
        return { success: true };
    }
    async setDefaultPaymentMethod(userId, id) {
        const paymentMethod = await this.paymentMethodRepo.findOne({ where: { id, userId } });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        await this.paymentMethodRepo.update({ userId }, { isDefault: false });
        paymentMethod.isDefault = true;
        return this.paymentMethodRepo.save(paymentMethod);
    }
    async validatePaymentMethodOwnership(userId, paymentMethodId) {
        const exists = await this.paymentMethodRepo.findOne({ where: { id: paymentMethodId, userId } });
        if (!exists) {
            throw new common_1.NotFoundException('Payment method not found or not owned by user');
        }
        return exists;
    }
};
exports.UserProfileService = UserProfileService;
exports.UserProfileService = UserProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(address_entity_1.AddressEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_method_entity_1.PaymentMethodEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserProfileService);
//# sourceMappingURL=user-profile.service.js.map