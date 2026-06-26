
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../../db/db-repositories.module';

import { PaymentWebhookEntity } from '../../../db/entities/payment-webhook.entity';
import { PaymentEventEntity } from '../payment-event.entity';
import { PaymentFraudFlagEntity } from '../payment-fraud.entity';
import { PaymentDisputeEntity } from '../../../db/entities/payment-dispute.entity';
import { WebhookService } from './webhook.service';
import { PaymentWebhookController } from './webhook.controller';
import { NotificationModule } from '../../../services/notifications/notification.module';
import { ChargebackModule } from '../chargeback/chargeback.module';
import { LedgerModule } from '../../../modules/ledger/ledger.module';
import { PaymentGatewayFactory } from '../gateway-factory.service';
import { StripeGateway } from '../gateways/stripe-gateway.service';
import { RazorpayGateway } from '../gateways/razorpay-gateway.service';

@Module({
  imports: [
    DbRepositoriesModule,
    NotificationModule,
    forwardRef(() => ChargebackModule),
    LedgerModule,
  ],
  providers: [WebhookService, PaymentGatewayFactory, StripeGateway, RazorpayGateway],
  controllers: [PaymentWebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}

