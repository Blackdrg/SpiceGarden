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
exports.NotificationPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_preference_entity_1 = require("../../db/entities/notification-preference.entity");
let NotificationPreferencesService = class NotificationPreferencesService {
    constructor(prefRepo) {
        this.prefRepo = prefRepo;
    }
    async getPreferences(userId) {
        let prefs = await this.prefRepo.findOne({ where: { userId } });
        if (!prefs) {
            prefs = this.prefRepo.create({ userId });
            prefs = await this.prefRepo.save(prefs);
        }
        return prefs;
    }
    async updatePreferences(userId, updates) {
        let prefs = await this.prefRepo.findOne({ where: { userId } });
        if (!prefs) {
            prefs = this.prefRepo.create({ userId, ...updates });
        }
        else {
            Object.assign(prefs, updates);
        }
        return this.prefRepo.save(prefs);
    }
    async shouldSendPush(userId, category) {
        const prefs = await this.getPreferences(userId);
        switch (category) {
            case 'orders': return prefs.pushOrders;
            case 'promotions': return prefs.pushPromotions;
            case 'deliveryUpdates': return prefs.pushDeliveryUpdates;
            default: return true;
        }
    }
};
exports.NotificationPreferencesService = NotificationPreferencesService;
exports.NotificationPreferencesService = NotificationPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreferenceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationPreferencesService);
//# sourceMappingURL=notification-preferences.service.js.map