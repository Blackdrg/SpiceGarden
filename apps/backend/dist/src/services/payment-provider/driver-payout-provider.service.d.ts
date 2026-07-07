import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
export interface DriverBankDetails {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
}
export interface DriverPayoutResult {
    payoutId: string;
    status: string;
    amount: number;
    processedAt: string;
    reference?: string;
}
export declare class DriverPayoutProviderService {
    private configService;
    private readonly incentiveRepo;
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly logger;
    private readonly baseUrl;
    private keyId;
    private keySecret;
    constructor(configService: ConfigService, incentiveRepo: Repository<DriverIncentiveEntity>, driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>);
    private rzpRequest;
    processDriverPayout(incentiveId: string, bankDetails: DriverBankDetails): Promise<DriverPayoutResult>;
    getPendingPayouts(driverId?: string): Promise<DriverIncentiveEntity[]>;
    getPayoutHistory(driverId: string, limit?: number): Promise<any[]>;
}
