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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const audit_log_entity_1 = require("../../db/entities/audit-log.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let AdminService = class AdminService {
    orderRepo;
    userRepo;
    driverRepo;
    auditRepo;
    branchRepo;
    restaurantRepo;
    dataSource;
    constructor(orderRepo, userRepo, driverRepo, auditRepo, branchRepo, restaurantRepo, dataSource) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.driverRepo = driverRepo;
        this.auditRepo = auditRepo;
        this.branchRepo = branchRepo;
        this.restaurantRepo = restaurantRepo;
        this.dataSource = dataSource;
    }
    async getDashboardStats(branchId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let where = { createdAt: (0, typeorm_2.Between)(today, new Date()) };
        if (branchId) {
            where = { ...where, restaurantId: branchId };
        }
        try {
            const [ordersToday, totalRevenue, activeDrivers, activeRestaurants] = await Promise.all([
                this.orderRepo.count({ where }),
                this.orderRepo.createQueryBuilder('order')
                    .select('SUM(order.grandTotal)', 'total')
                    .where('order.createdAt >= :today', { today })
                    .getRawOne(),
                this.driverRepo.count({ where: { isOnline: true } }),
                this.restaurantRepo.count({ where: { status: 'active' } }),
            ]);
            const branches = await this.getBranchStats();
            const revenueData = await this.getRevenueData();
            const [disputeCount, refundCount] = await Promise.all([
                this.getDisputeCount(today),
                this.getRefundCount(today),
            ]);
            return {
                stats: {
                    revenue: Number(totalRevenue?.total) || 0,
                    orders: ordersToday,
                    driversOnline: activeDrivers,
                    complaints: disputeCount,
                    refunds: refundCount,
                    fraudAlerts: 0,
                    activeBranches: activeRestaurants,
                    pendingWithdrawals: 0,
                },
                revenueData,
                branches,
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
                    activeBranches: 0,
                    pendingWithdrawals: 0,
                },
                revenueData: [],
                branches: [],
            };
        }
    }
    async getDisputeCount(since) {
        return this.dataSource
            .createQueryBuilder()
            .select('COUNT(*)', 'count')
            .from('disputes', 'd')
            .where('d.createdAt >= :since', { since })
            .getRawOne()
            .then((result) => Number(result?.count) || 0);
    }
    async getRefundCount(since) {
        return this.dataSource
            .createQueryBuilder()
            .select('COUNT(*)', 'count')
            .from('refunds', 'r')
            .where('r.createdAt >= :since', { since })
            .getRawOne()
            .then((result) => Number(result?.count) || 0);
    }
    async getBranchStats() {
        const branches = await this.branchRepo?.find?.() || [];
        return branches.map(branch => ({
            name: branch.branchName || 'Branch',
            status: 'operational',
            orderCount: 0,
            avgPrepMins: 15,
            driversAssigned: 0,
        }));
    }
    async getRevenueData() {
        const result = await this.orderRepo
            .createQueryBuilder('order')
            .select([
            `DATE_TRUNC('hour', order.createdAt) as hour`,
            'SUM(order.grandTotal) as revenue',
            'COUNT(*) as orders',
        ])
            .where('order.createdAt >= :today', { today: new Date(new Date().setHours(0, 0, 0, 0)) })
            .groupBy('DATE_TRUNC(\'hour\', order.createdAt)')
            .orderBy('hour', 'ASC')
            .limit(24)
            .getRawMany();
        return result.map((row) => ({
            t: new Date(row.hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            revenue: Number(row.revenue) || 0,
            orders: Number(row.orders) || 0,
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
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(6, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AdminService);
