import { Connection } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
export declare class AdminService {
    private readonly connection;
    private readonly orderRepo;
    private readonly userRepo;
    private readonly driverRepo;
    private readonly auditRepo;
    private readonly branchRepo;
    private readonly restaurantRepo;
    constructor(connection: Connection);
    getDashboardStats(branchId?: string): Promise<{
        stats: {
            revenue: number;
            orders: number;
            driversOnline: number;
            complaints: number;
            refunds: number;
            fraudAlerts: number;
            activeBranches: number;
            pendingWithdrawals: number;
        };
        revenueData: {
            t: string;
            revenue: number;
            orders: number;
        }[];
        branches: {
            name: any;
            status: string;
            orderCount: number;
            avgPrepMins: number;
            driversAssigned: number;
        }[];
    }>;
    private getDisputeCount;
    private getRefundCount;
    private getBranchStats;
    private getRevenueData;
    logAction(action: string, userId: string, entityType: string, entityId: string, metadata: any): Promise<AuditLogEntity>;
    getAllOrders(page?: number, limit?: number): Promise<OrderEntity[]>;
    banUser(userId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
