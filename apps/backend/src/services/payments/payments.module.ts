
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { PaymentService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentHardeningService } from './payment-hardening.service';
import { RetryService } from './retry.service';
import { FraudHardeningService } from './fraud-hardening.service';
import { IdempotencyService } from './idempotency.service';
import { PaymentGatewayFactory } from './gateway-factory.service';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { AuditModule } from '../../audit/audit.module';
import { LedgerModule } from '../../modules/ledger/ledger.module';
import { GSTModule } from '../../services/gst/gst.module';
import { ChargebackModule } from './chargeback/chargeback.module';

@Module({
  imports: [
    DbRepositoriesModule,
    AuditModule,
    LedgerModule,
    GSTModule,
    ChargebackModule,
  ],
  providers: [
    PaymentService, 
    PaymentHardeningService, 
    RetryService, 
    FraudHardeningService, 
    IdempotencyService,
    PaymentGatewayFactory,
    StripeGateway,
    RazorpayGateway,
  ],
  controllers: [PaymentsController],
  exports: [
    PaymentService, 
    PaymentHardeningService, 
    RetryService, 
    FraudHardeningService, 
    IdempotencyService,
    PaymentGatewayFactory,
  ],
})
export class PaymentServiceModule {}

