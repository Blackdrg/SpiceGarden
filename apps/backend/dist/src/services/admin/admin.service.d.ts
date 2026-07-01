import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
export declare class AdminService {
    private readonly orderRepo;
    private readonly userRepo;
    private readonly driverRepo;
    private readonly auditRepo;
    private readonly branchRepo;
    private readonly restaurantRepo;
    private readonly dataSource;
    constructor(orderRepo: Repository<OrderEntity>, userRepo: Repository<UserEntity>, driverRepo: Repository<DriverEntity>, auditRepo: Repository<AuditLogEntity>, branchRepo: Repository<RestaurantBranchEntity>, restaurantRepo: Repository<RestaurantEntity>, dataSource: DataSource);
    getDashboardStats(branchId?: string): Promise<{
        stats: {
            revenue: number;
            orders: any;
            driversOnline: any;
            complaints: number;
            refunds: number;
            fraudAlerts: number;
            activeBranches: any;
            pendingWithdrawals: number;
        };
        revenueData: any;
        branches: any;
    }>;
    private getDisputeCount;
    private getRefundCount;
    private getBranchStats;
    private getRevenueData;
    logAction(action: string, userId: string, entityType: string, entityId: string, metadata: any): Promise<any>;
    getAllOrders(page?: number, limit?: number): Promise<any>;
    banUser(userId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
