import { DataSource } from 'typeorm';
export declare class AdminService {
    private readonly connection;
    private readonly orderRepo;
    private readonly userRepo;
    private readonly driverRepo;
    private readonly auditRepo;
    private readonly branchRepo;
    private readonly restaurantRepo;
    constructor(connection: DataSource);
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
