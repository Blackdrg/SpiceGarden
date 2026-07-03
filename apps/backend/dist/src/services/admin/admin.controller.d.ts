import { AdminService } from './admin.service';
import { type Request } from 'express';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(query: any): Promise<{
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
    getFullStats(query: any): Promise<{
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
    getOrders(page: string, limit: string): Promise<import("../../db/entities").OrderEntity[]>;
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
