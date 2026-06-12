
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { PaymentService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentHardeningService } from './payment-hardening.service';
import { RetryService } from './retry.service';
import { FraudHardeningService } from './fraud-hardening.service';
import { IdempotencyService } from './idempotency.service';
import { PaymentGatewayFactory } from './gateway-factory.service';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { IdempotencyEntity } from './idempotency.entity';
import { PaymentValidationEventEntity } from './payment-validation.entity';
import { PaymentFraudFlagEntity } from './payment-fraud.entity';
import { PaymentEventEntity } from './payment-event.entity';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { AuditModule } from '../../audit/audit.module';
import { LedgerModule } from '../../modules/ledger/ledger.module';
import { GSTModule } from '../../services/gst/gst.module';
import { ChargebackModule } from './chargeback/chargeback.module';
import { PaymentDisputeEntity } from '../../db/entities/payment-dispute.entity';
import { ChargebackService } from './chargeback/chargeback.service';

@Module({
  imports: [
    LocalRepositoryModule,
    AuditModule,
    LedgerModule,
    GSTModule,
    forwardRef(() => ChargebackModule),
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
    ChargebackService
  ],
  controllers: [PaymentsController],
  exports: [
    PaymentService, 
    PaymentHardeningService, 
    RetryService, 
    FraudHardeningService, 
    IdempotencyService,
    PaymentGatewayFactory,
    ChargebackService
  ],
})
export class PaymentServiceModule {}

