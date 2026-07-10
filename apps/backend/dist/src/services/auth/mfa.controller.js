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
exports.MfaController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const mfa_service_1 = require("./mfa.service");
let MfaController = class MfaController {
    mfaService;
    constructor(mfaService) {
        this.mfaService = mfaService;
    }
    async setup(req) {
        if (!req.user) {
            throw new common_1.UnauthorizedException();
        }
        return this.mfaService.generateSecret(req.user);
    }
    async enable(req, body) {
        if (!req.user) {
            throw new common_1.UnauthorizedException();
        }
        if (!body.code) {
            throw new common_1.BadRequestException('MFA code is required.');
        }
        const isSuccess = await this.mfaService.enableMfa(req.user.id, body.code);
        return { enabled: isSuccess };
    }
    async disable(req, body) {
        if (!req.user) {
            throw new common_1.UnauthorizedException();
        }
        if (!body.code) {
            throw new common_1.BadRequestException('MFA code is required.');
        }
        const isSuccess = await this.mfaService.disableMfa(req.user.id, body.code);
        if (!isSuccess)
            throw new common_1.UnauthorizedException('Invalid MFA code.');
        return { disabled: isSuccess };
    }
};
exports.MfaController = MfaController;
__decorate([
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "setup", null);
__decorate([
    (0, common_1.Post)('enable'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "enable", null);
__decorate([
    (0, common_1.Post)('disable'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "disable", null);
exports.MfaController = MfaController = __decorate([
    (0, common_1.Controller)('mfa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mfa_service_1.MfaService])
], MfaController);
