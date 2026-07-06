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
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const surge_zone_entity_1 = require("../../db/entities/surge-zone.entity");
let MapsService = class MapsService {
    surgeZoneRepo;
    constructor(surgeZoneRepo) {
        this.surgeZoneRepo = surgeZoneRepo;
    }
    async calculateETA(origin, destination) {
        const surge = await this.calculateSurgeMultiplier(origin, destination);
        const distance = this.calculateDistance(origin, destination);
        const duration = Math.round(distance / 80);
        return {
            duration,
            distance,
            surgeMultiplier: surge,
        };
    }
    async calculateSurgeETA(origin, destination) {
        const surge = await this.calculateSurgeMultiplier(origin, destination);
        const distance = this.calculateDistance(origin, destination);
        const duration = Math.round(distance / 70);
        return {
            duration,
            distance,
            surgeMultiplier: surge,
        };
    }
    async getReroutingOptions(origin, destination, waypoints) {
        return {
            routes: [
                {
                    coordinates: [origin, destination],
                    duration: Math.round(this.calculateDistance(origin, destination) / 80),
                    distance: this.calculateDistance(origin, destination),
                    trafficImpact: 0.2,
                },
            ],
        };
    }
    async getHeatmapData(bounds, zoom) {
        return [];
    }
    async getSurgeZones() {
        return this.surgeZoneRepo.find({ where: { isActive: true } });
    }
    async isAddressInSurgeZone(lat, lng) {
        return { inSurgeZone: false };
    }
    calculateDistance(a, b) {
        const R = 6371e3;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const lat1 = a.lat * Math.PI / 180;
        const lat2 = b.lat * Math.PI / 180;
        const haversine = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        return R * c;
    }
    async calculateSurgeMultiplier(origin, destination) {
        return 1.0;
    }
};
exports.MapsService = MapsService;
exports.MapsService = MapsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(surge_zone_entity_1.SurgeZoneEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MapsService);
