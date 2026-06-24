import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { PayoutReportEntity, PayoutStatus } from '../../db/entities/payout-report.entity';
import { getRequiredSecret } from '../../common/errors/missing-env.error';

export interface StripeConnectAccountData {
  legalBusinessName: string;
  businessType: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  gstin?: string;
  pan?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

export interface StripeConnectAccountResult {
  accountId: string;
  status: string;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  onboardingUrl?: string;
}

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);
  private readonly stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(PayoutReportEntity)
    private readonly payoutRepo: Repository<PayoutReportEntity>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_CONNECT_SECRET_KEY') || getRequiredSecret(this.configService, 'STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10',
    });
  }

  async createConnectAccount(
    restaurantId: string,
    accountData: StripeConnectAccountData
  ): Promise<StripeConnectAccountResult> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    try {
      const account = await (this.stripe.accounts as any).create({
        type: 'standard',
        country: 'IN',
        email: accountData.email,
        business_type: this.mapBusinessType(accountData.businessType),
        company: {
          name: accountData.legalBusinessName,
          structure: this.mapBusinessStructure(accountData.businessType),
          address: {
            line1: accountData.address.line1,
            city: accountData.address.city,
            state: accountData.address.state,
            postal_code: accountData.address.postalCode,
            country: accountData.address.country,
          },
          tax_id: accountData.gstin || accountData.pan,
        },
        individual: {
          first_name: accountData.bankAccount?.accountHolderName?.split(' ')[0] || 'Business',
          last_name: accountData.bankAccount?.accountHolderName?.split(' ').slice(1).join(' ') || 'Owner',
          email: accountData.email,
          phone: accountData.phone,
          address: {
            line1: accountData.address.line1,
            city: accountData.address.city,
            state: accountData.address.state,
            postal_code: accountData.address.postalCode,
            country: accountData.address.country,
          },
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          restaurantId,
          gstin: accountData.gstin || '',
        },
      });

      const accountResult: StripeConnectAccountResult = {
        accountId: account.id,
        status: account.details_submitted ? 'active' : 'incomplete',
        detailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        requirementsDue: account.requirements?.currently_due || [],
      };

      if (!account.details_submitted) {
        const accountLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${this.configService.get<string>('APP_URL')}/restaurant/onboarding/refresh`,
          return_url: `${this.configService.get<string>('APP_URL')}/restaurant/onboarding/complete`,
          type: 'account_onboarding',
        });
        accountResult.onboardingUrl = accountLink.url;
      }

      restaurant.stripeAccountId = account.id;
      await this.restaurantRepo.save(restaurant);

      this.logger.log(`Created Stripe Connect account ${account.id} for restaurant ${restaurantId}`);
      return accountResult;
    } catch (error) {
      this.logger.error(`Failed to create Stripe Connect account for restaurant ${restaurantId}:`, error);
      throw new BadRequestException(`Stripe Connect account creation failed: ${(error as Error).message}`);
    }
  }

  async registerWebhook(accountId: string): Promise<{ endpointId: string; status: string }> {
    const webhookUrl = this.configService.get<string>('STRIPE_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn('STRIPE_WEBHOOK_URL not configured, skipping webhook registration');
      return { endpointId: '', status: 'skipped' };
    }

    try {
      const webhookSecret = this.configService.get<string>('STRIPE_CONNECT_WEBHOOK_SECRET') || this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

      const endpoint = await (this.stripe.webhookEndpoints as any).create({
        url: webhookUrl,
        enabled_events: [
          'account.updated',
          'account.application.deauthorized',
          'payout.created',
          'payout.paid',
          'payout.failed',
        ],
        api_version: '2024-04-10',
        secret: webhookSecret,
        metadata: {
          restaurantStripeAccount: accountId,
          type: 'connect_webhook',
        },
      }, {
        stripeAccount: accountId,
      });

      this.logger.log(`Registered Stripe Connect webhook endpoint ${endpoint.id} for account ${accountId}`);
      return { endpointId: endpoint.id, status: 'active' };
    } catch (error) {
      this.logger.error(`Failed to register Stripe Connect webhook for account ${accountId}:`, error);
      return { endpointId: '', status: 'failed' };
    }
  }

  async getAccountStatus(restaurantId: string): Promise<StripeConnectAccountResult> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant?.stripeAccountId) {
      throw new NotFoundException('No Stripe Connect account found for this restaurant');
    }

    try {
      const account = await this.stripe.accounts.retrieve(restaurant.stripeAccountId);

      return {
        accountId: account.id,
        status: account.details_submitted ? (account.payouts_enabled ? 'active' : 'pending_verification') : 'incomplete',
        detailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        requirementsDue: (account.requirements?.currently_due as string[]) || [],
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve Stripe Connect account for restaurant ${restaurantId}:`, error);
      throw new BadRequestException(`Failed to retrieve account status: ${(error as Error).message}`);
    }
  }

  async sendPayout(
    restaurantId: string,
    payoutId: string,
    amount: number,
    currency = 'inr'
  ): Promise<{ payoutId: string; status: string }> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant?.stripeAccountId) {
      throw new BadRequestException('No Stripe Connect account found. Complete onboarding first.');
    }

    const payoutReport = await this.payoutRepo.findOne({ where: { id: payoutId } });
    if (!payoutReport) {
      throw new NotFoundException('Payout report not found');
    }

    if (payoutReport.restaurantId !== restaurantId) {
      throw new BadRequestException('Payout does not belong to this restaurant');
    }

    try {
      const platformFeePercent = this.configService.get<number>('STRIPE_PLATFORM_FEE_PERCENT', 5);
      const platformFee = Math.round((amount * platformFeePercent / 100) * 100);
      const amountInPaise = Math.round(amount * 100);

      const transfer = await this.stripe.transfers.create({
        amount: amountInPaise,
        currency,
        destination: restaurant.stripeAccountId,
        transfer_group: `payout_${payoutId}`,
        metadata: {
          restaurantId,
          payoutId,
          type: 'platform_payout',
        },
      }, {
        stripeAccount: restaurant.stripeAccountId,
      });

      await this.payoutRepo.update(payoutId, {
        status: PayoutStatus.PROCESSING,
        payoutReference: `stripe_transfer_${transfer.id}`,
        payoutDate: new Date(),
      });

      this.logger.log(`Stripe payout initiated: ${transfer.id} for restaurant ${restaurantId}, payout ${payoutId}`);
      return {
        payoutId: transfer.id,
        status: 'processing',
      };
    } catch (error) {
      this.logger.error(`Stripe payout failed for restaurant ${restaurantId}:`, error);
      await this.payoutRepo.update(payoutId, {
        status: PayoutStatus.FAILED,
      });
      throw new BadRequestException(`Payout failed: ${(error as Error).message}`);
    }
  }

  async getPayoutHistory(restaurantId: string, limit = 10): Promise<any[]> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant?.stripeAccountId) {
      return [];
    }

    try {
      const payouts = await this.stripe.payouts.list(
        { limit },
        { stripeAccount: restaurant.stripeAccountId } as any,
      );

      return payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
        method: payout.method,
        failureCode: payout.failure_code,
        failureMessage: payout.failure_message,
      }));
    } catch (error) {
      this.logger.error(`Failed to retrieve payout history for restaurant ${restaurantId}:`, error);
      return [];
    }
  }

  async getAccountBalance(restaurantId: string): Promise<{ available: number; pending: number }> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant?.stripeAccountId) {
      return { available: 0, pending: 0 };
    }

    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: restaurant.stripeAccountId,
      });

      const availableInr = balance.available.find((b) => b.currency === 'inr');
      const pendingInr = balance.pending.find((b) => b.currency === 'inr');

      return {
        available: (availableInr?.amount || 0) / 100,
        pending: (pendingInr?.amount || 0) / 100,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve balance for restaurant ${restaurantId}:`, error);
      return { available: 0, pending: 0 };
    }
  }

  private mapBusinessType(internalType: string): string {
    return internalType;
  }

  private mapBusinessStructure(internalType: string): string {
    return internalType;
  }
}
