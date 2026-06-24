import { AdminService } from './admin.service';
import { type Request } from 'express';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(query: any): Promise<{
        stats: {
            revenue: any;
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
            name: string;
            status: string;
            orderCount: number;
            avgPrepMins: number;
            driversAssigned: number;
        }[];
        tickets: never[];
    }>;
    getFullStats(query: any): Promise<{
        stats: {
            revenue: any;
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
            name: string;
            status: string;
            orderCount: number;
            avgPrepMins: number;
            driversAssigned: number;
        }[];
        tickets: never[];
    }>;
    getOrders(page: string, limit: string): Promise<import("../../db/entities/order.entity").OrderEntity[]>;
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
