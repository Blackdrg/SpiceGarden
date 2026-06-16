import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(query: any): unknown;
    getFullStats(query: any): unknown;
    getOrders(page: string, limit: string): unknown;
    banUser(body: {
        userId: string;
        reason: string;
    }, req: any): unknown;
}
