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
exports.BranchManagementService = void 0;
const common_1 = require("@nestjs/common");
let BranchManagementService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BranchManagementService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BranchManagementService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        branchRepo;
        restaurantRepo;
        dataSource;
        logger = new common_1.Logger(BranchManagementService.name);
        constructor(branchRepo, restaurantRepo, dataSource) {
            this.branchRepo = branchRepo;
            this.restaurantRepo = restaurantRepo;
            this.dataSource = dataSource;
        }
        async createBranch(restaurantId, branchData) {
            const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
            if (!restaurant) {
                throw new common_1.NotFoundException('Restaurant not found');
            }
            const branch = this.branchRepo.create({
                restaurant: { id: restaurantId },
                branchName: branchData.branchName,
                address: branchData.address,
                openingTime: branchData.openingTime || '09:00',
                closingTime: branchData.closingTime || '21:00',
                location: { lat: branchData.lat, lng: branchData.lng },
                isOnline: false,
            });
            const saved = await this.branchRepo.save(branch);
            return saved;
        }
        async updateBranch(branchId, updateData) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch) {
                throw new common_1.NotFoundException('Branch not found');
            }
            const { lat, lng, ...rest } = updateData;
            const updatePayload = { ...rest };
            if (lat !== undefined && lng !== undefined) {
                updatePayload.location = { lat, lng };
            }
            await this.branchRepo.update(branchId, updatePayload);
            const updated = await this.branchRepo.findOne({ where: { id: branchId } });
            return updated;
        }
        async toggleBranchStatus(branchId, isOnline) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch) {
                throw new common_1.NotFoundException('Branch not found');
            }
            await this.branchRepo.update(branchId, { isOnline });
            this.logger.log(`Branch ${branchId} status updated to ${isOnline ? 'online' : 'offline'}`);
            return this.branchRepo.findOne({ where: { id: branchId } });
        }
        async getBranchDetails(branchId) {
            return this.branchRepo.findOne({
                where: { id: branchId },
                relations: ['restaurant'],
            });
        }
        async getBranchesByRestaurant(restaurantId) {
            return this.branchRepo.find({
                where: { restaurant: { id: restaurantId } },
                relations: ['restaurant'],
                order: { branchName: 'ASC' },
            });
        }
        async getAllBranches(filter) {
            const where = {};
            if (filter?.isOnline !== undefined) {
                where.isOnline = filter.isOnline;
            }
            if (filter?.restaurantId) {
                where.restaurant = { id: filter.restaurantId };
            }
            return this.branchRepo.find({
                where,
                relations: ['restaurant'],
                order: { branchName: 'ASC' },
            });
        }
        async deleteBranch(branchId) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch) {
                throw new common_1.NotFoundException('Branch not found');
            }
            await this.branchRepo.softDelete(branchId);
        }
    };
    return BranchManagementService = _classThis;
})();
exports.BranchManagementService = BranchManagementService;
