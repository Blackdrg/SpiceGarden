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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AdminService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderRepo;
        userRepo;
        driverRepo;
        auditRepo;
        constructor(orderRepo, userRepo, driverRepo, auditRepo) {
            this.orderRepo = orderRepo;
            this.userRepo = userRepo;
            this.driverRepo = driverRepo;
            this.auditRepo = auditRepo;
        }
        async getDashboardStats(branchId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let where = { createdAt: (0, typeorm_1.Between)(today, new Date()) };
            if (branchId) {
                where = { ...where, restaurantId: branchId };
            }
            try {
                const [ordersToday, totalRevenue] = await Promise.all([
                    this.orderRepo.count({ where }),
                    this.orderRepo.createQueryBuilder('order')
                        .select('SUM(order.grandTotal)', 'total')
                        .where('order.createdAt >= :today', { today })
                        .getRawOne(),
                ]);
                const activeDrivers = await this.driverRepo.count({ where: { isOnline: true } });
                return {
                    stats: {
                        revenue: totalRevenue?.total || 0,
                        orders: ordersToday,
                        driversOnline: activeDrivers,
                        complaints: 0,
                        refunds: 0,
                        fraudAlerts: 0,
                        activeBranches: 3,
                        pendingWithdrawals: 0,
                    },
                    revenueData: this.generateMockRevenueData(),
                    branches: [
                        { name: 'Downtown', status: 'operational', orderCount: 12, avgPrepMins: 15, driversAssigned: 8 },
                        { name: 'Mall Road', status: 'operational', orderCount: 8, avgPrepMins: 12, driversAssigned: 6 },
                        { name: 'Gulshan', status: 'operational', orderCount: 5, avgPrepMins: 10, driversAssigned: 4 },
                    ],
                    tickets: [],
                };
            }
            catch (e) {
                return {
                    stats: {
                        revenue: 0,
                        orders: 0,
                        driversOnline: 0,
                        complaints: 0,
                        refunds: 0,
                        fraudAlerts: 0,
                        activeBranches: 3,
                        pendingWithdrawals: 0,
                    },
                    revenueData: this.generateMockRevenueData(),
                    branches: [
                        { name: 'Downtown', status: 'operational', orderCount: 0, avgPrepMins: 15, driversAssigned: 0 },
                        { name: 'Mall Road', status: 'operational', orderCount: 0, avgPrepMins: 12, driversAssigned: 0 },
                        { name: 'Gulshan', status: 'operational', orderCount: 0, avgPrepMins: 10, driversAssigned: 0 },
                    ],
                    tickets: [],
                };
            }
        }
        generateMockRevenueData() {
            const now = new Date();
            return Array.from({ length: 24 }, (_, i) => ({
                t: `${String(i).padStart(2, '0')}:00`,
                revenue: Math.floor(Math.random() * 2000) + 500,
                orders: Math.floor(Math.random() * 20) + 5,
            }));
        }
        async logAction(action, userId, entityType, entityId, metadata) {
            const log = this.auditRepo.create({
                action,
                performedBy: userId,
                entityType,
                entityId,
                metadata,
            });
            return this.auditRepo.save(log);
        }
        async getAllOrders(page = 1, limit = 10) {
            return this.orderRepo.find({
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' },
            });
        }
        async banUser(userId, reason) {
            await this.userRepo.update(userId, { status: 'suspended' });
            return { success: true };
        }
    };
    return AdminService = _classThis;
})();
exports.AdminService = AdminService;
