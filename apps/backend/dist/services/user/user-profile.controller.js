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
exports.UserProfileController = void 0;
const common_1 = require("@nestjs/common");
const user_profile_service_1 = require("./user-profile.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let UserProfileController = class UserProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getAddresses(req) {
        const userId = req.user?.sub;
        return this.profileService.getAddresses(userId);
    }
    async createAddress(req, body) {
        const userId = req.user?.sub;
        return this.profileService.createAddress(userId, body);
    }
    async updateAddress(req, id, body) {
        const userId = req.user?.sub;
        return this.profileService.updateAddress(userId, id, body);
    }
    async deleteAddress(req, id) {
        const userId = req.user?.sub;
        return this.profileService.deleteAddress(userId, id);
    }
    async getPaymentMethods(req) {
        const userId = req.user?.sub;
        return this.profileService.getPaymentMethods(userId);
    }
    async createPaymentMethod(req, body) {
        const userId = req.user?.sub;
        return this.profileService.createPaymentMethod(userId, body);
    }
    async deletePaymentMethod(req, id) {
        const userId = req.user?.sub;
        return this.profileService.deletePaymentMethod(userId, id);
    }
    async setDefaultPaymentMethod(req, id) {
        const userId = req.user?.sub;
        return this.profileService.setDefaultPaymentMethod(userId, id);
    }
};
exports.UserProfileController = UserProfileController;
__decorate([
    (0, common_1.Get)('addresses'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getAddresses", null);
__decorate([
    (0, common_1.Post)('addresses'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "createAddress", null);
__decorate([
    (0, common_1.Put)('addresses/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)('addresses/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.Get)('payment-methods'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.Post)('payment-methods'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "createPaymentMethod", null);
__decorate([
    (0, common_1.Delete)('payment-methods/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "deletePaymentMethod", null);
__decorate([
    (0, common_1.Put)('payment-methods/:id/set-default'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "setDefaultPaymentMethod", null);
exports.UserProfileController = UserProfileController = __decorate([
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_profile_service_1.UserProfileService])
], UserProfileController);
//# sourceMappingURL=user-profile.controller.js.map