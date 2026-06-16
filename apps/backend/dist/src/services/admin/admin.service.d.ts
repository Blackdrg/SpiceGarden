import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
export declare class AdminService {
    private readonly orderRepo;
    private readonly userRepo;
    private readonly driverRepo;
    private readonly auditRepo;
    constructor(orderRepo: Repository<OrderEntity>, userRepo: Repository<UserEntity>, driverRepo: Repository<DriverEntity>, auditRepo: Repository<AuditLogEntity>);
    getDashboardStats(branchId?: string): unknown;
    private generateMockRevenueData;
    logAction(action: string, userId: string, entityType: string, entityId: string, metadata: any): unknown;
    getAllOrders(page?: number, limit?: number): unknown;
    banUser(userId: string, reason: string): unknown;
}
