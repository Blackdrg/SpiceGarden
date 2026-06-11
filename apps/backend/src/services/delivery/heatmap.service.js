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
exports.HeatmapService = void 0;
const common_1 = require("@nestjs/common");
let HeatmapService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var HeatmapService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HeatmapService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        branchRepo;
        driverRepo;
        orderRepo;
        surgeZoneRepo;
        dataSource;
        logger = new common_1.Logger(HeatmapService.name);
        constructor(branchRepo, driverRepo, orderRepo, surgeZoneRepo, dataSource) {
            this.branchRepo = branchRepo;
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.surgeZoneRepo = surgeZoneRepo;
            this.dataSource = dataSource;
        }
        async generateDeliveryHeatmap(centralPoint, radiusKm = 10) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            // Get recent deliveries for heatmap
            const recentOrders = await this.orderRepo
                .createQueryBuilder('order')
                .where('order.createdAt >= :since', { since: twentyFourHoursAgo })
                .andWhere('order.status IN (:...statuses)', { statuses: ['delivered', 'completed'] })
                .getMany();
            // Aggregate delivery points into heatmap grid
            const grid = {};
            for (const order of recentOrders) {
                const key = this.hashToGrid(order.deliveryAddressId || '', 0.001);
                grid[key] = (grid[key] || 0) + 1;
            }
            // Convert grid to points (simulated for demo)
            const points = Object.entries(grid).map(([key, weight]) => {
                const [lat, lng] = this.gridToCoords(key);
                return { lat, lng, weight };
            });
            // Add current driver locations as heatmap points
            const onlineDrivers = await this.driverRepo.find({
                where: { isOnline: true, isAvailable: false },
            });
            onlineDrivers.forEach(driver => {
                if (driver.currentLocation) {
                    points.push({
                        lat: Number(driver.currentLocation.lat),
                        lng: Number(driver.currentLocation.lng),
                        weight: 2,
                    });
                }
            });
            return {
                points,
                maxWeight: Math.max(...points.map(p => p.weight), 1),
                totalDeliveries: recentOrders.length,
            };
        }
        async getSurgeZoneStatus(point) {
            const activeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });
            for (const zone of activeZones) {
                if (zone.polygon && this.isPointInPolygon(point, zone.polygon)) {
                    return {
                        inSurgeZone: true,
                        multiplier: Number(zone.multiplier),
                        zoneName: zone.name,
                    };
                }
            }
            return { inSurgeZone: false, multiplier: 1.0 };
        }
        async calculateSurgeAdjustedETA(origin, destination) {
            const surgeCheck = await this.getSurgeZoneStatus(origin);
            // Use basic distance calculation if Google Maps not available
            const distanceKm = this.calculateDistance(origin, destination);
            const avgSpeedKmh = 30;
            const durationMinutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
            const buffer = durationMinutes * 0.2;
            const etaMinutes = Math.ceil(durationMinutes + buffer);
            return {
                etaMinutes,
                surgeMultiplier: surgeCheck.multiplier,
                surgeZone: surgeCheck.zoneName,
            };
        }
        async createSurgeZone(name, polygon, multiplier, startTime, endTime) {
            const zone = this.surgeZoneRepo.create({
                name,
                polygon,
                multiplier,
                startTime,
                endTime,
            });
            return await this.surgeZoneRepo.save(zone);
        }
        async updateSurgeZone(zoneId, updates) {
            await this.surgeZoneRepo.update(zoneId, updates);
            return this.surgeZoneRepo.findOne({ where: { id: zoneId } });
        }
        async getAllSurgeZones() {
            return await this.surgeZoneRepo.find({ order: { isActive: 'DESC' } });
        }
        isPointInPolygon(point, polygon) {
            const x = point.lng, y = point.lat;
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].lng, yi = polygon[i].lat;
                const xj = polygon[j].lng, yj = polygon[j].lat;
                const intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        }
        hashToGrid(hash, gridSize) {
            // Simple hash-based grid for demo
            return `${Math.floor(Math.random() / gridSize) * gridSize},${Math.floor(Math.random() / gridSize) * gridSize}`;
        }
        gridToCoords(hash) {
            const [lat, lng] = hash.split(',').map(Number);
            return [lat, lng];
        }
        calculateDistance(loc1, loc2) {
            const R = 6371;
            const φ1 = loc1.lat * Math.PI / 180;
            const φ2 = loc2.lat * Math.PI / 180;
            const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
            const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }
    };
    return HeatmapService = _classThis;
})();
exports.HeatmapService = HeatmapService;
