"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
let MapsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MapsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MapsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        surgeZoneRepo;
        branchRepo;
        logger = new common_1.Logger(MapsService.name);
        googleMapsApiKey;
        baseUrl = 'https://maps.googleapis.com/maps/api';
        constructor(configService, surgeZoneRepo, branchRepo) {
            this.configService = configService;
            this.surgeZoneRepo = surgeZoneRepo;
            this.branchRepo = branchRepo;
            this.googleMapsApiKey = this.configService.get('GOOGLE_MAPS_API_KEY') || '';
        }
        async calculateETA(origin, destination) {
            if (!this.googleMapsApiKey) {
                return this.calculateHaversineETA(origin, destination);
            }
            try {
                const response = await fetch(`${this.baseUrl}/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=now&key=${this.googleMapsApiKey}`);
                const data = await response.json();
                const row = data.rows?.[0];
                const element = row?.elements?.[0];
                if (!element) {
                    throw new Error('No route found');
                }
                const trafficLevel = this.determineTrafficLevel(element.duration.value, element.duration_in_traffic?.value || element.duration.value);
                return {
                    distance: element.distance.value,
                    duration: element.duration.value,
                    durationInTraffic: element.duration_in_traffic?.value || element.duration.value,
                    trafficLevel,
                };
            }
            catch (error) {
                this.logger.error('Google Maps ETA failed, using fallback:', error);
                return this.calculateHaversineETA(origin, destination);
            }
        }
        calculateHaversineETA(origin, destination) {
            const R = 6371e3;
            const dLat = (destination.lat - origin.lat) * Math.PI / 180;
            const dLng = (destination.lng - origin.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return {
                distance,
                duration: distance / 1000 * 60,
                durationInTraffic: distance / 1000 * 72,
                trafficLevel: 'normal',
            };
        }
        determineTrafficLevel(normalDuration, trafficDuration) {
            const ratio = trafficDuration / normalDuration;
            if (ratio < 1.1)
                return 'light';
            if (ratio < 1.3)
                return 'normal';
            if (ratio < 1.6)
                return 'heavy';
            return 'severe';
        }
        async calculateSurgeETA(origin, destination) {
            const baseETA = await this.calculateETA(origin, destination);
            const surgeMultiplier = await this.getSurgeMultiplier(origin.lat, origin.lng);
            return {
                ...baseETA,
                durationInTraffic: Math.round(baseETA.durationInTraffic * surgeMultiplier),
            };
        }
        async getSurgeMultiplier(lat, lng) {
            const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });
            for (const zone of surgeZones) {
                if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    if (zone.startTime && zone.endTime) {
                        const startHour = parseInt(zone.startTime.split(':')[0]);
                        const endHour = parseInt(zone.endTime.split(':')[0]);
                        if (currentHour >= startHour && currentHour <= endHour) {
                            return Number(zone.multiplier);
                        }
                    }
                    return Number(zone.multiplier);
                }
            }
            return 1.0;
        }
        isPointInPolygon(point, polygon) {
            const x = point.lng, y = point.lat;
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].lng, yi = polygon[i].lat;
                const xj = polygon[j].lng, yj = polygon[j].lat;
                const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        }
        async getReroutingOptions(origin, destination, waypoints) {
            if (!this.googleMapsApiKey) {
                return {
                    alternativeRoutes: [],
                    originalRoute: { distance: 0, duration: 0 },
                };
            }
            try {
                const waypointParam = waypoints && waypoints.length > 0
                    ? `&waypoints=${waypoints.map(w => w.lat + ',' + w.lng).join('|')}`
                    : '';
                const response = await fetch(`${this.baseUrl}/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&alternatives=true&key=${this.googleMapsApiKey}${waypointParam}`);
                const data = await response.json();
                const routes = data.routes || [];
                const originalRoute = routes[0];
                const alternativeRoutes = routes.slice(1).map((route) => ({
                    distance: route.legs?.[0]?.distance?.value || 0,
                    duration: route.legs?.[0]?.duration?.value || 0,
                    summary: route.summary || '',
                }));
                return {
                    alternativeRoutes,
                    originalRoute: {
                        distance: originalRoute?.legs?.[0]?.distance?.value || 0,
                        duration: originalRoute?.legs?.[0]?.duration?.value || 0,
                    },
                };
            }
            catch (error) {
                this.logger.error('Rerouting failed:', error);
                return {
                    alternativeRoutes: [],
                    originalRoute: { distance: 0, duration: 0 },
                };
            }
        }
        async getHeatmapData(bounds, zoom = 12) {
            const branches = await this.branchRepo
                .createQueryBuilder('branch')
                .where('ST_Y(branch.location) BETWEEN :south AND :north', { south: bounds.south, north: bounds.north })
                .andWhere('ST_X(branch.location) BETWEEN :west AND :east', { west: bounds.west, east: bounds.east })
                .getMany();
            return branches.map(branch => ({
                lat: branch.location.lat,
                lng: branch.location.lng,
                weight: Math.floor(Math.random() * 100) + 1,
            }));
        }
        async getSurgeZones() {
            return this.surgeZoneRepo.find({ where: { isActive: true } });
        }
        async isAddressInSurgeZone(lat, lng) {
            const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });
            for (const zone of surgeZones) {
                if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
                    return {
                        inSurgeZone: true,
                        multiplier: Number(zone.multiplier),
                        zoneName: zone.name,
                    };
                }
            }
            return { inSurgeZone: false };
        }
    };
    return MapsService = _classThis;
})();
exports.MapsService = MapsService;
