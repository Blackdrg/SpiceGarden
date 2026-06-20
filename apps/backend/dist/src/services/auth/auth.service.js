"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = __importStar(require("argon2"));
const crypto = __importStar(require("crypto"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const session_entity_1 = require("../../db/entities/session.entity");
let AuthService = class AuthService {
    jwtService;
    configService;
    userRepo;
    sessionRepo;
    constructor(jwtService, configService, userRepo, sessionRepo) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
    }
    async hashPassword(password) {
        return argon2.hash(password);
    }
    async verifyPassword(password, hash) {
        return argon2.verify(hash, password);
    }
    async createSession(userId, deviceInfo, refreshToken = '') {
        const sessionDurationDays = Number(this.configService.get('SESSION_DURATION_DAYS', 30));
        const session = this.sessionRepo.create({
            userId,
            deviceName: deviceInfo.name,
            deviceType: deviceInfo.type,
            ipAddress: deviceInfo.ip,
            refreshToken,
            expiresAt: new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000),
        });
        return this.sessionRepo.save(session);
    }
    async validateUser(email, pass) {
        if (!email || !pass) {
            throw new common_1.UnauthorizedException('Credentials required');
        }
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (await this.verifyPassword(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        throw new common_1.UnauthorizedException('Invalid email or password');
    }
    async login(user, deviceInfo) {
        const payload = { email: user.email, sub: user.id, role: user.role, status: user.status };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = crypto.randomBytes(Number(this.configService.get('REFRESH_TOKEN_LENGTH', 40))).toString('hex');
        await this.createSession(user.id, deviceInfo, refreshToken);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async refreshAccessToken(refreshToken, deviceInfo) {
        const session = await this.sessionRepo.findOne({
            where: { refreshToken, isActive: true },
            relations: { user: true },
        });
        if (!session || !session.user || session.expiresAt.getTime() <= Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const nextRefreshToken = crypto.randomBytes(Number(this.configService.get('REFRESH_TOKEN_LENGTH', 40))).toString('hex');
        session.refreshToken = nextRefreshToken;
        session.lastActiveAt = new Date();
        session.deviceName = deviceInfo.name;
        session.deviceType = deviceInfo.type;
        session.ipAddress = deviceInfo.ip;
        await this.sessionRepo.save(session);
        const payload = {
            email: session.user.email,
            sub: session.user.id,
            role: session.user.role,
            status: session.user.status,
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: nextRefreshToken,
        };
    }
    async revokeSession(refreshToken) {
        const session = await this.sessionRepo.findOne({ where: { refreshToken } });
        if (!session) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        session.isActive = false;
        session.lastActiveAt = new Date();
        await this.sessionRepo.save(session);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
