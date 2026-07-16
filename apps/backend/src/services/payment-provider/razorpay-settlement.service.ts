import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { PayoutReportEntity, PayoutStatus } from '../../db/entities/payout-report.entity';
import { getRequiredSecret } from '../../common/errors/missing-env.error';

export interface RazorpaySettlementAccountData {
  legalBusinessName: string;
  email: string;
  phone: string;
  businessType: string;
  gstin?: string;
  pan?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

export interface RazorpaySettlementResult {
  settlementId: string;
  status: string;
  amount: number;
  currency: string;
  processedAt: string;
  fees: number;
  tax: number;
}

export interface RazorpayFundAccountResult {
  fundAccountId: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

@Injectable()
export class RazorpaySettlementService {
  private readonly logger = new Logger(RazorpaySettlementService.name);
  private readonly baseUrl = 'https://api.razorpay.com/v1';
  private keyId: string;
  private keySecret: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(PayoutReportEntity)
    private readonly payoutRepo: Repository<PayoutReportEntity>,
  ) {
    this.keyId = getRequiredSecret(this.configService, 'RAZORPAY_KEY_ID');
    this.keySecret = getRequiredSecret(this.configService, 'RAZORPAY_KEY_SECRET');
  }

  private async rzpRequest(method: string, endpoint: string, data?: Record<string, any>): Promise<any> {
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
      throw new BadRequestException(message);
    }

    if (method === 'DELETE') {
      return {};
    }

    return response.json();
  }

  async createFundAccount(
    restaurantId: string,
    accountData: RazorpaySettlementAccountData
  ): Promise<RazorpayFundAccountResult> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    try {
      const fundAccount = await this.rzpRequest('POST', 'fund_accounts', {
        account_type: 'bank_account',
        bank_account: {
          name: accountData.bankAccount.accountHolderName,
          ifsc: accountData.bankAccount.ifscCode,
          account_number: accountData.bankAccount.accountNumber,
        },
        contact: {
          name: accountData.legalBusinessName,
          email: accountData.email,
          phone: accountData.phone,
          type: 'vendor',
          reference_type: 'restaurant',
          reference_id: restaurantId,
          gstin: accountData.gstin || undefined,
          pan: accountData.pan || undefined,
        },
        notes: {
          restaurant_id: restaurantId,
          gstin: accountData.gstin || '',
          business_type: accountData.businessType,
        },
      });

      restaurant.razorpayFundAccountId = fundAccount.id;
      await this.restaurantRepo.save(restaurant);

      this.logger.log(`Created Razorpay fund account ${fundAccount.id} for restaurant ${restaurantId}`);
      return {
        fundAccountId: fundAccount.id,
        bankDetails: {
          accountNumber: accountData.bankAccount.accountNumber.slice(-4).padStart(accountData.bankAccount.accountNumber.length, '*'),
          ifscCode: accountData.bankAccount.ifscCode,
          bankName: accountData.bankAccount.bankName,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create Razorpay fund account for restaurant ${restaurantId}:`, error);
      throw new BadRequestException(`Fund account creation failed: ${(error as Error).message}`);
    }
  }

  async processPayout(
    restaurantId: string,
    payoutId: string,
    amount: number,
    currency = 'INR'
  ): Promise<RazorpaySettlementResult> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (!restaurant.razorpayFundAccountId) {
      throw new BadRequestException('No fund account found. Complete settlement onboarding first.');
    }

    const payoutReport = await this.payoutRepo.findOne({ where: { id: payoutId } });
    if (!payoutReport) {
      throw new NotFoundException('Payout report not found');
    }

    if (payoutReport.restaurantId !== restaurantId) {
      throw new BadRequestException('Payout does not belong to this restaurant');
    }

    try {
      const platformFeePercent = this.configService.get<number>('RAZORPAY_PLATFORM_FEE_PERCENT', 2);
      const amountInPaise = Math.round(amount * 100);
      const fee = Math.round((amount * platformFeePercent / 100) * 100);
      const tax = Math.round(fee * 0.18);
      const effectiveAmount = amountInPaise - fee - tax;

      const settlement = await this.rzpRequest('POST', 'settlements', {
        amount: effectiveAmount,
        currency,
        mode: 'IMPS',
        fund_account_id: restaurant.razorpayFundAccountId,
        notify_sms: true,
        notify_email: true,
        notes: {
          restaurant_id: restaurantId,
          payout_id: payoutId,
          type: 'platform_payout',
        },
      });

      await this.payoutRepo.update(payoutId, {
        status: PayoutStatus.PROCESSING,
        payoutReference: `rzp_settlement_${settlement.id}`,
        payoutDate: new Date(),
      });

      this.logger.log(`Razorpay payout initiated: ${settlement.id} for restaurant ${restaurantId}`);
      return {
        settlementId: settlement.id,
        status: settlement.status || 'processing',
        amount: settlement.amount / 100,
        currency: settlement.currency,
        processedAt: new Date(settlement.created_at * 1000).toISOString(),
        fees: settlement.fees / 100,
        tax: settlement.tax / 100,
      };
    } catch (error) {
      this.logger.error(`Razorpay payout failed for restaurant ${restaurantId}:`, error);
      await this.payoutRepo.update(payoutId, {
        status: PayoutStatus.FAILED,
      });
      throw new BadRequestException(`Payout failed: ${(error as Error).message}`);
    }
  }

  async getSettlementHistory(restaurantId: string, limit = 10): Promise<RazorpaySettlementResult[]> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant?.razorpayFundAccountId) {
      return [];
    }

    try {
      const settlements = await this.rzpRequest('GET', `settlements?limit=${limit}`);

      return (settlements.items || settlements || []).map((s: any) => ({
        settlementId: s.id,
        status: s.status,
        amount: s.amount / 100,
        currency: s.currency,
        processedAt: new Date(s.created_at * 1000).toISOString(),
        fees: s.fees / 100,
        tax: s.tax / 100,
      }));
    } catch (error) {
      this.logger.error(`Failed to retrieve settlement history for restaurant ${restaurantId}:`, error);
      return [];
    }
  }

  async getAccountStatus(restaurantId: string): Promise<{ status: string; fundAccountId?: string }> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (!restaurant.razorpayFundAccountId) {
      return { status: 'not_created' };
    }

    try {
      const fundAccount = await this.rzpRequest('GET', `fund_accounts/${restaurant.razorpayFundAccountId}`);
      return {
        status: fundAccount.active ? 'active' : 'inactive',
        fundAccountId: restaurant.razorpayFundAccountId,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve fund account status for restaurant ${restaurantId}:`, error);
      return {
        status: 'error',
        fundAccountId: restaurant.razorpayFundAccountId,
      };
    }
  }

  async getAccountBalance(restaurantId: string): Promise<{ available: number; pending: number; currency: string }> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    try {
      const balance = await this.rzpRequest('GET', 'balance');

      const availableInr = (balance as any).available?.find((b: any) => b.currency === 'INR');
      const pendingInr = (balance as any).pending?.find((b: any) => b.currency === 'INR');

      return {
        available: (availableInr?.amount || 0) / 100,
        pending: (pendingInr?.amount || 0) / 100,
        currency: 'INR',
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve balance for restaurant ${restaurantId}:`, error);
      return {
        available: 0,
        pending: 0,
        currency: 'INR',
      };
    }
  }
}
