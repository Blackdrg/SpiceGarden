import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, Between } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class AdminService {
  private readonly orderRepo: Repository<OrderEntity>;
  private readonly userRepo: Repository<UserEntity>;
  private readonly driverRepo: Repository<DriverEntity>;
  private readonly auditRepo: Repository<AuditLogEntity>;
  private readonly branchRepo: Repository<RestaurantBranchEntity>;
  private readonly restaurantRepo: Repository<RestaurantEntity>;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    this.orderRepo = this.connection.getRepository(OrderEntity);
    this.userRepo = this.connection.getRepository(UserEntity);
    this.driverRepo = this.connection.getRepository(DriverEntity);
    this.auditRepo = this.connection.getRepository(AuditLogEntity);
    this.branchRepo = this.connection.getRepository(RestaurantBranchEntity);
    this.restaurantRepo = this.connection.getRepository(RestaurantEntity);
  }


  async getDashboardStats(branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let where: any = { createdAt: Between(today, new Date()) };
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
    } catch (e) {
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

  private async getDisputeCount(since: Date): Promise<number> {
    return this.connection
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('disputes', 'd')
      .where('d.createdAt >= :since', { since })
      .getRawOne()
      .then((result: any) => Number(result?.count) || 0);
  }

  private async getRefundCount(since: Date): Promise<number> {
    return this.connection
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('refunds', 'r')
      .where('r.createdAt >= :since', { since })
      .getRawOne()
      .then((result: any) => Number(result?.count) || 0);
  }

  private async getBranchStats() {
    const branches = await this.branchRepo?.find?.() || [];
    return branches.map(branch => ({
      name: (branch as any).branchName || 'Branch',
      status: 'operational',
      orderCount: 0,
      avgPrepMins: 15,
      driversAssigned: 0,
    }));
  }

  private async getRevenueData() {
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

    return result.map((row: any) => ({
      t: new Date(row.hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      revenue: Number(row.revenue) || 0,
      orders: Number(row.orders) || 0,
    }));
  }

  async logAction(action: string, userId: string, entityType: string, entityId: string, metadata: any) {
    const log = this.auditRepo.create({
      action,
      performedBy: userId,
      entityType,
      entityId,
      metadata,
    });
    return this.auditRepo.save(log);
  }

  async getAllOrders(page: number = 1, limit: number = 10) {
    return this.orderRepo.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async banUser(userId: string, reason: string) {
    await this.userRepo.update(userId, { status: 'suspended' as any });
    return { success: true };
  }
}
