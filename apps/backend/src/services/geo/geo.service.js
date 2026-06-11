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
exports.GeoService = void 0;
const common_1 = require("@nestjs/common");
let GeoService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GeoService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GeoService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        restaurantRepo;
        branchRepo;
        driverRepo;
        orderRepo;
        dataSource;
        EARTH_RADIUS_KM = 6371;
        AVERAGE_SPEED_KMH = 30;
        constructor(restaurantRepo, branchRepo, driverRepo, orderRepo, dataSource) {
            this.restaurantRepo = restaurantRepo;
            this.branchRepo = branchRepo;
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.dataSource = dataSource;
        }
        calculateDistance(point1, point2) {
            const dLat = this.toRadians(point2.lat - point1.lat);
            const dLng = this.toRadians(point2.lng - point1.lng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(point1.lat)) *
                    Math.cos(this.toRadians(point2.lat)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return this.EARTH_RADIUS_KM * c;
        }
        predictETA(distance, speedKmh = this.AVERAGE_SPEED_KMH) {
            const duration = (distance / speedKmh) * 60;
            const buffer = duration * 0.2;
            const eta = Math.ceil(duration + buffer);
            return {
                eta,
                distance,
                duration: Math.ceil(duration),
            };
        }
        async findNearbyBranches(customerLocation, radiusInKm = 5, limit = 20) {
            const radius = radiusInKm * 1000;
            return this.branchRepo
                .createQueryBuilder('branch')
                .leftJoinAndSelect('branch.restaurant', 'restaurant')
                .select([
                'branch',
                'restaurant',
                `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`,
            ])
                .where(`ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng: customerLocation.lng, lat: customerLocation.lat, radius })
                .andWhere('branch.isOnline = :isOnline', { isOnline: true })
                .andWhere('restaurant.isActive = :isActive', { isActive: true })
                .orderBy('distance', 'ASC')
                .limit(limit)
                .getRawMany()
                .then((results) => results.map((r) => ({
                ...r.branch,
                distance: r.distance / 1000,
                restaurant: r.restaurant,
            })));
        }
        async findNearestBranchForOrder(restaurantId, customerLocation) {
            const branches = await this.branchRepo.find({
                where: { isOnline: true },
            });
            if (!branches.length)
                return null;
            let nearest = branches[0];
            let minDistance = Infinity;
            for (const branch of branches) {
                if (branch.location) {
                    const branchPoint = {
                        lat: Number(branch.location.lat),
                        lng: Number(branch.location.lng),
                    };
                    const distance = this.calculateDistance(customerLocation, branchPoint);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = branch;
                    }
                }
            }
            return nearest;
        }
        async findAvailableDrivers(restaurantLocation, radiusInKm = 5, limit = 10) {
            const radius = radiusInKm * 1000;
            return this.driverRepo
                .createQueryBuilder('driver')
                .select([
                'driver',
                `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`,
            ])
                .where('driver.isOnline = :isOnline', { isOnline: true })
                .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })
                .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng: restaurantLocation.lng, lat: restaurantLocation.lat, radius })
                .orderBy('distance', 'ASC')
                .limit(limit)
                .getRawMany()
                .then((results) => results.map((r) => r.driver));
        }
        async calculateDeliveryRoute(restaurantLocation, customerLocation) {
            const distance = this.calculateDistance(restaurantLocation, customerLocation);
            return this.predictETA(distance);
        }
        toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }
    };
    return GeoService = _classThis;
})();
exports.GeoService = GeoService;
