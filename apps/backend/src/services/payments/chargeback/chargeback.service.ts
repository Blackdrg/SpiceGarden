import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentDisputeEntity } from '../../../db/entities/payment-dispute.entity';
import { OrderEntity } from '../../../db/entities/order.entity';
import { UserEntity } from '../../../db/entities/user.entity';
import { NotificationService } from '../../../services/notifications/notification.service';
import { ProductionNotificationService } from '../../../services/notifications/production-notification.service';
import Stripe from 'stripe';

@Injectable()
export class ChargebackService {
  private readonly logger = new Logger(ChargebackService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(PaymentDisputeEntity)
    private readonly disputeRepo: Repository<PaymentDisputeEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly notificationService: NotificationService,
    private readonly productionNotification: ProductionNotificationService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  async handleDisputeCreated(event: any): Promise<PaymentDisputeEntity> {
    try {
      const dispute = event.data.object as Stripe.Dispute;
      
      const charge = await this.stripe.charges.retrieve(typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id);
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      
      const order = paymentIntentId ? await this.orderRepo.findOne({ 
        where: { paymentIntentId: paymentIntentId } 
      }) : null;
      
      if (!order) {
        this.logger.warn(`Order not found for payment intent ${paymentIntentId || 'any'}`);
      }

      const existingDispute = await this.disputeRepo.findOne({
        where: { disputeId: dispute.id }
      });
      
      if (existingDispute) {
        this.logger.warn(`Dispute ${dispute.id} already exists in our system`);
        return existingDispute;
      }

       const paymentDispute = this.disputeRepo.create({
         disputeId: dispute.id,
         orderId: order ? order.id : null,
         order: order,
         disputeType: dispute.reason,
         disputedAmount: dispute.amount / 100,
         currency: dispute.currency,
         reason: dispute.reason,
         evidence: dispute.evidence || {},
         status: this.mapStripeDisputeStatus(dispute.status),
       } as any);

      const savedDispute = await this.disputeRepo.save(paymentDispute);
      
      if (order) {
          await this.productionNotification.sendPaymentNotification(
            order.userId,
            dispute.id,
            {
              type: 'fraud_detected',
              severity: 'high',
              orderId: order.id,
              amount: dispute.amount / 100,
              message: `Chargeback received for amount ${(dispute.amount / 100).toFixed(2)}. Reason: ${dispute.reason}`,
              metadata: {
                disputeId: dispute.id,
                stripeDisputeReason: dispute.reason,
              }
            }
          );
      }
      
      this.logger.log(`Created dispute record for Stripe dispute ${dispute.id}`);
      return savedDispute as unknown as PaymentDisputeEntity;
    } catch (error) {
      this.logger.error(`Failed to handle dispute created:`, error);
      throw new InternalServerErrorException('Failed to process dispute');
    }
  }

  async handleDisputeClosed(event: any): Promise<PaymentDisputeEntity> {
    try {
      const dispute = event.data.object as Stripe.Dispute;
      
      const paymentDispute = await this.disputeRepo.findOne({
        where: { disputeId: dispute.id }
      });
      
      if (!paymentDispute) {
        this.logger.warn(`Dispute ${dispute.id} not found in our system`);
        throw new NotFoundException(`Dispute ${dispute.id} not found`);
      }

      paymentDispute.status = this.mapStripeDisputeStatus(dispute.status);
       paymentDispute.chargedBackAmount = ((dispute as any).chargeback_amount ? (dispute as any).chargeback_amount / 100 : null) as any;
       paymentDispute.chargedBackAt = ((dispute as any).chargeback_at ? new Date((dispute as any).chargeback_at * 1000) : null) as any;
      
      if (dispute.status === 'won' && paymentDispute.isRefundedToCustomer === false) {
        this.logger.log(`Dispute ${dispute.id} was won, considering customer refund`);
      }

      const updatedDispute = await this.disputeRepo.save(paymentDispute);
      
      const order = paymentDispute.orderId ? 
        await this.orderRepo.findOne({ where: { id: paymentDispute.orderId } }) : 
        null;
      
      if (order) {
           await this.productionNotification.sendPaymentNotification(
             order.userId,
              `chargeback-resolution-${dispute.id}`,
              {
                type: dispute.status === 'won' ? 'payment_success' : 'payment_failure',
                severity: dispute.status === 'won' ? 'medium' : 'high',
                orderId: order.id,
                amount: paymentDispute.disputedAmount,
                message: `Chargeback ${dispute.id}: ${dispute.status}`,
                metadata: {
                  disputeId: dispute.id,
                  stripeDisputeStatus: dispute.status,
                  chargedBackAmount: paymentDispute.chargedBackAmount
                }
              }
            );
      }
      
      this.logger.log(`Updated dispute record for Stripe dispute ${dispute.id} with status ${dispute.status}`);
      return updatedDispute;
    } catch (error) {
      this.logger.error(`Failed to handle dispute closed:`, error);
      throw new InternalServerErrorException('Failed to process dispute closure');
    }
  }

  async getDisputeById(disputeId: string): Promise<PaymentDisputeEntity> {
    const dispute = await this.disputeRepo.findOne({
      where: { disputeId: disputeId },
      relations: ['order']
    });
    
    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }
    
    return dispute;
  }

  async getDisputesForOrder(orderId: string): Promise<PaymentDisputeEntity[]> {
    return await this.disputeRepo.find({
      where: { orderId: orderId },
      order: { createdAt: 'DESC' }
    });
  }

   async getDisputesByStatus(status: 'warning' | 'needs_response' | 'under_review' | 'won' | 'lost'): Promise<PaymentDisputeEntity[]> {
     return await this.disputeRepo.find({
       where: { status: status },
       order: { createdAt: 'DESC' }
     });
   }

    private mapStripeDisputeStatus(stripeStatus: string): 'warning' | 'needs_response' | 'under_review' | 'won' | 'lost' {
        switch (stripeStatus) {
            case 'warning':
                return 'warning';
            case 'needs_response':
                return 'needs_response';
            case 'under_review':
                return 'under_review';
            case 'won':
                return 'won';
            case 'lost':
                return 'lost';
            default:
                return 'under_review';
        }
    }

  async getDisputeStats(startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = MoreThanOrEqual(startDate);
      if (endDate) {
        where.createdAt = LessThanOrEqual(endDate);
      }
    }

    const [
      totalDisputes,
      wonDisputes,
      lostDisputes,
      underReviewDisputes,
      needsResponseDisputes,
      warningDisputes,
      totalDisputedAmount,
      totalChargedBackAmount
    ] = await Promise.all([
      this.disputeRepo.count({ where }),
      this.disputeRepo.count({ where: { ...where, status: 'won' } } as any),
      this.disputeRepo.count({ where: { ...where, status: 'lost' } } as any),
      this.disputeRepo.count({ where: { ...where, status: 'under_review' } } as any),
      this.disputeRepo.count({ where: { ...where, status: 'needs_response' } } as any),
      this.disputeRepo.count({ where: { ...where, status: 'warning' } } as any),
      this.disputeRepo
        .createQueryBuilder('dispute')
        .select('SUM(dispute.disputedAmount)', 'total')
        .where(where)
        .getRawOne(),
      this.disputeRepo
        .createQueryBuilder('dispute')
        .select('SUM(dispute.chargedBackAmount)', 'total')
        .where({ ...where, chargedBackAmount: MoreThanOrEqual(0) } as any)
        .getRawOne(),
    ]);

    return {
      totalDisputes,
      wonDisputes,
      lostDisputes,
      underReviewDisputes,
      needsResponseDisputes,
      warningDisputes,
      winRate: totalDisputes > 0 ? (wonDisputes / totalDisputes) * 100 : 0,
      totalDisputedAmount: totalDisputedAmount?.total || 0,
      totalChargedBackAmount: totalChargedBackAmount?.total || 0,
      netLoss: (totalChargedBackAmount?.total || 0) - (totalDisputedAmount?.total || 0)
    };
  }
}