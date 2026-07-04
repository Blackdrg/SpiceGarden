import { AdminService } from './admin.service';
import { type Request } from 'express';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(query: any): Promise<{
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
    getFullStats(query: any): Promise<{
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
    getOrders(page: string, limit: string): Promise<any>;
    banUser(body: {
        userId: string;
        reason: string;
    }, req: Request & {
        user: {
            id: string;
            role: string;
        };
    }): Promise<{
        success: boolean;
    }>;
}
