import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SettlementReportEntity, SettlementStatus, SettlementType } from '../../db/entities/settlement-report.entity';
import { PayoutReportEntity, PayoutStatus } from '../../db/entities/payout-report.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { PaymentStatus } from '../../shared/domain/order.interface';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

export interface ReconciliationReport {
  gateway: string;
  settlementDate: Date;
  totalOrders: number;
  totalOrderAmount: number;
  totalSettledAmount: number;
  settledCount: number;
  unsettledOrders: Array<{ orderId: string; amount: number }>;
  amountMismatch: number;
  status: 'matched' | 'discrepancy';
}

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(SettlementReportEntity)
    private settlementRepo: Repository<SettlementReportEntity>,
    @InjectRepository(PayoutReportEntity)
    private payoutRepo: Repository<PayoutReportEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    private dataSource: DataSource,
  ) {}

  async createSettlementReport(settlementData: Partial<SettlementReportEntity>): Promise<SettlementReportEntity> {
    const settlement = this.settlementRepo.create(settlementData);
    settlement.status = SettlementStatus.PENDING;
    settlement.netAmount = Number(settlement.totalAmount) - Number(settlement.gatewayFee || 0) - Number(settlement.taxAmount || 0);
    return this.settlementRepo.save(settlement);
  }

  async getSettlementReports(filters?: {
    settlementType?: SettlementType;
    status?: SettlementStatus;
    restaurantId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SettlementReportEntity[]> {
    const where: any = {};
    if (filters?.settlementType) where.settlementType = filters.settlementType;
    if (filters?.status) where.status = filters.status;
    if (filters?.restaurantId) where.restaurantId = filters.restaurantId;

    const query = this.settlementRepo.createQueryBuilder('settlement');
    if (filters?.startDate) query.andWhere('settlement.settlementDate >= :startDate', { startDate: filters.startDate });
    if (filters?.endDate) query.andWhere('settlement.settlementDate <= :endDate', { endDate: filters.endDate });

    return query.orderBy('settlement.settlementDate', 'DESC').getMany();
  }

  async getSettlementReport(id: string): Promise<SettlementReportEntity> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement report not found');
    return settlement;
  }

  async processSettlement(id: string): Promise<SettlementReportEntity> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement report not found');

    settlement.status = SettlementStatus.PROCESSING;
    settlement.processedAt = new Date();
    await this.settlementRepo.save(settlement);

    settlement.status = SettlementStatus.COMPLETED;
    return this.settlementRepo.save(settlement);
  }

  async failSettlement(id: string, reason: string): Promise<SettlementReportEntity> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement report not found');

    settlement.status = SettlementStatus.FAILED;
    settlement.failureReason = reason;
    settlement.retryCount++;
    return this.settlementRepo.save(settlement);
  }

  async retrySettlement(id: string): Promise<SettlementReportEntity> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement report not found');

    if (settlement.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts reached');
    }

    settlement.status = SettlementStatus.PROCESSING;
    settlement.retryCount++;
    return this.settlementRepo.save(settlement);
  }

  async generatePayoutSettlement(payoutId: string): Promise<SettlementReportEntity> {
    const payout = await this.payoutRepo.findOne({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout report not found');

    const settlement = this.settlementRepo.create({
      settlementType: SettlementType.PAYOUT,
      gateway: 'razorpay',
      gatewayBatchId: `batch_${Date.now()}`,
      totalAmount: Number(payout.netPayout),
      netAmount: Number(payout.netPayout),
      settlementDate: new Date(),
      payoutId: payout.id,
      restaurantId: payout.restaurantId,
      breakdown: {
        orderCount: payout.orderBreakdown?.totalOrders,
        commissionAmount: Number(payout.platformCommission),
        feeAmount: 0,
      },
    });

    return this.createSettlementReport(settlement);
  }

  async getSettlementSummary(restaurantId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const settlements = await this.settlementRepo.find({
      where: {
        restaurantId,
        settlementDate: Between(startDate, endDate),
      },
    });

    const totalSettled = settlements
      .filter(s => s.status === SettlementStatus.COMPLETED)
      .reduce((sum, s) => sum + Number(s.netAmount), 0);

    const pendingSettlements = settlements.filter(s => s.status === SettlementStatus.PENDING).length;
    const failedSettlements = settlements.filter(s => s.status === SettlementStatus.FAILED).length;

    return {
      restaurantId,
      period: { month, year },
      totalSettled,
      totalTransactions: settlements.length,
      pendingSettlements,
      failedSettlements,
      settlements,
    };
  }

  async reconcileGatewayPayments(
    gateway: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReconciliationReport> {
    const settlements = await this.settlementRepo.find({
      where: {
        gateway,
        settlementDate: Between(startDate, endDate),
        status: SettlementStatus.COMPLETED,
      },
    });

    const settledRefIds = new Set<string>();
    let totalSettledAmount = 0;
    for (const s of settlements) {
      totalSettledAmount += Number(s.netAmount);
      if (s.transactions) {
        for (const t of s.transactions) {
          settledRefIds.add(t.referenceId);
        }
      }
    }

    const orders = await this.orderRepo.find({
      where: {
        paymentStatus: PaymentStatus.COMPLETED,
        createdAt: Between(startDate, endDate),
      },
      select: ['id', 'grandTotal', 'paymentIntentId'],
    });

    const unsettledOrders: Array<{ orderId: string; amount: number }> = [];
    let totalOrderAmount = 0;
    for (const order of orders) {
      totalOrderAmount += Number(order.grandTotal);
      if (!settledRefIds.has(order.id)) {
        unsettledOrders.push({ orderId: order.id, amount: Number(order.grandTotal) });
      }
    }

    const settledCount = orders.length - unsettledOrders.length;
    const amountMismatch = Math.abs(totalOrderAmount - totalSettledAmount);
    const status = amountMismatch < 1 && unsettledOrders.length === 0 ? 'matched' : 'discrepancy';

    this.logger.log(
      `Reconciliation for gateway=${gateway}, period=${startDate.toISOString()} to ${endDate.toISOString()}: ` +
      `orders=${orders.length}, settled=${settledCount}, unsettled=${unsettledOrders.length}, mismatch=${amountMismatch}`
    );

    return {
      gateway,
      settlementDate: endDate,
      totalOrders: orders.length,
      totalOrderAmount,
      totalSettledAmount,
      settledCount,
      unsettledOrders,
      amountMismatch,
      status,
    };
  }
}
