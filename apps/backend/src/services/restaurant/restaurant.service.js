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
exports.RestaurantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let RestaurantService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RestaurantService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RestaurantService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        restaurantRepo;
        branchRepo;
        dataSource;
        constructor(restaurantRepo, branchRepo, dataSource) {
            this.restaurantRepo = restaurantRepo;
            this.branchRepo = branchRepo;
            this.dataSource = dataSource;
        }
        async getAllRestaurants() {
            return this.restaurantRepo.find({
                relations: ['branches'],
                where: { status: 'active' },
            });
        }
        async findNearby(lat, lng, radiusInKm = 5) {
            if (lat && lng) {
                try {
                    const radius = radiusInKm * 1000;
                    return this.branchRepo
                        .createQueryBuilder('branch')
                        .leftJoinAndSelect('branch.restaurant', 'restaurant')
                        .select([
                        'branch',
                        'restaurant',
                        `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`
                    ])
                        .where(`ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
                        .andWhere('branch.isOnline = :isOnline', { isOnline: true })
                        .orderBy('distance', 'ASC')
                        .getMany();
                }
                catch (e) {
                    return this.branchRepo.find({
                        where: { isOnline: true },
                        relations: ['restaurant'],
                        take: 20,
                    });
                }
            }
            return this.branchRepo.find({
                where: { isOnline: true },
                relations: ['restaurant'],
                take: 20,
            });
        }
        async getRestaurantDetails(slug) {
            return this.restaurantRepo.findOne({
                where: { slug },
                relations: ['branches', 'branches.categories', 'branches.categories.items'],
            });
        }
        async searchRestaurants(query) {
            return this.restaurantRepo.find({
                where: [
                    { name: (0, typeorm_1.Like)(`%${query}%`) },
                    { description: (0, typeorm_1.Like)(`%${query}%`) },
                ],
                relations: ['branches'],
            });
        }
        async updateBranchStatus(branchId, isOnline) {
            return this.branchRepo.update(branchId, { isOnline });
        }
    };
    return RestaurantService = _classThis;
})();
exports.RestaurantService = RestaurantService;
