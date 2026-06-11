import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DriverIncentiveEntity, IncentiveStatus, IncentiveType } from '../../db/entities/driver-incentive.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus } from '../../shared/domain/order.interface';

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

@Injectable()
export class DriverPayoutProviderService {
  private readonly logger = new Logger(DriverPayoutProviderService.name);
  private readonly baseUrl = 'https://api.razorpay.com/v1';
  private keyId: string;
  private keySecret: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DriverIncentiveEntity)
    private readonly incentiveRepo: Repository<DriverIncentiveEntity>,
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'test_placeholder';
  }

  private async rzpRequest(method: string, endpoint: string, data?: Record<string, unknown>): Promise<any> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' && method !== 'DELETE' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = (errorData as any)?.error?.description || `Razorpay API error: ${response.status}`;
      throw new Error(message);
    }

    if (method === 'DELETE') {
      return {};
    }

    return response.json();
  }

  async processDriverPayout(
    incentiveId: string,
    bankDetails: DriverBankDetails
  ): Promise<DriverPayoutResult> {
    const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
    if (!incentive) {
      throw new NotFoundException('Incentive record not found');
    }

    if (incentive.status !== IncentiveStatus.APPROVED) {
      throw new BadRequestException(`Incentive must be APPROVED before payout. Current status: ${incentive.status}`);
    }

    const driver = await this.driverRepo.findOne({ where: { id: incentive.driverId } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    try {
      const fundAccount = await this.rzpRequest('POST', 'fund_accounts', {
        account_type: 'bank_account',
        bank_account: {
          name: bankDetails.accountHolderName,
          ifsc: bankDetails.ifscCode,
          account_number: bankDetails.accountNumber,
        },
        contact: {
          name: bankDetails.accountHolderName,
          type: 'customer',
          reference_type: 'driver',
          reference_id: driver.id,
        },
        notes: {
          driver_id: driver.id,
          incentive_id: incentiveId,
          type: 'driver_payout',
        },
      });

      const amountInPaise = Math.round(Number(incentive.amount) * 100);
      const settlement = await this.rzpRequest('POST', 'settlements', {
        amount: amountInPaise,
        currency: 'INR',
        mode: 'IMPS',
        fund_account_id: fundAccount.id,
        notify_sms: true,
        notes: {
          driver_id: driver.id,
          incentive_id: incentiveId,
          type: 'driver_incentive_payout',
        },
      });

      await this.incentiveRepo.update(incentiveId, {
        status: IncentiveStatus.PAID,
        payoutReference: `rzp_settlement_${settlement.id}`,
        paidAt: new Date(),
      });

      this.logger.log(`Driver payout processed: ${settlement.id} for driver ${driver.id}, incentive ${incentiveId}`);
      return {
        payoutId: settlement.id,
        status: settlement.status || 'processing',
        amount: incentive.amount,
        processedAt: new Date(settlement.created_at * 1000).toISOString(),
        reference: `rzp_settlement_${settlement.id}`,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Driver payout failed for incentive ${incentiveId}:`, err);
      throw new BadRequestException(`Driver payout failed: ${err.message}`);
    }
  }

  async getPendingPayouts(driverId?: string): Promise<DriverIncentiveEntity[]> {
    const where: { status: IncentiveStatus; driverId?: string } = { status: IncentiveStatus.APPROVED };
    if (driverId) {
      where.driverId = driverId;
    }

    return this.incentiveRepo.find({
      where,
      relations: ['driver'],
      order: { createdAt: 'ASC' },
    });
  }

  async getPayoutHistory(driverId: string, limit = 10): Promise<any[]> {
    return this.incentiveRepo.find({
      where: { driverId, status: IncentiveStatus.PAID },
      order: { paidAt: 'DESC' },
      take: limit,
    });
  }
}
