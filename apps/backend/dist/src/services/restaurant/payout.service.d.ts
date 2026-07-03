import { Repository, Connection } from 'typeorm';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { CommissionRuleEntity } from '../../db/entities/commission-rule.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
export declare class PayoutService {
    private payoutRepo;
    private orderRepo;
    private restaurantRepo;
    private commissionRepo;
    private gstRepo;
    private readonly connection;
    private readonly logger;
    constructor(payoutRepo: Repository<PayoutReportEntity>, orderRepo: Repository<OrderEntity>, restaurantRepo: Repository<RestaurantEntity>, commissionRepo: Repository<CommissionRuleEntity>, gstRepo: Repository<GSTDetailEntity>, connection: Connection);
    generatePayoutReport(restaurantId: string, periodStart: Date, periodEnd: Date): Promise<PayoutReportEntity>;
    getPayoutHistory(restaurantId: string, limit?: number): Promise<PayoutReportEntity[]>;
    processPayout(payoutId: string, reference: string): Promise<PayoutReportEntity>;
    getPendingPayouts(restaurantId?: string): Promise<PayoutReportEntity[]>;
    getPayoutSummary(restaurantId: string, month: number, year: number): Promise<any>;
}
