
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
import { RiskZoneService } from '../risk/risk-zone.service';
import { RiskZoneModule } from '../risk/risk-zone.module';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { GooglePayGateway } from './gateways/googlepay-gateway.service';
import { PhonePeGateway } from './gateways/phonepe-gateway.service';
import { PaytmGateway } from './gateways/paytm-gateway.service';
import { BhimUpiGateway } from './gateways/bhim-upi-gateway.service';
import { NetBankingGateway } from './gateways/netbanking-gateway.service';
import { EmiGateway } from './gateways/emi-gateway.service';
import { SplitPaymentGateway } from './gateways/split-payment-gateway.service';
import { CashOnDeliveryGateway } from './gateways/cod-gateway.service';
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
    RiskZoneModule,
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
    GooglePayGateway,
    PhonePeGateway,
    PaytmGateway,
    BhimUpiGateway,
    NetBankingGateway,
    EmiGateway,
    SplitPaymentGateway,
    CashOnDeliveryGateway,
  ],
  controllers: [PaymentsController],
  exports: [
    PaymentService, 
    PaymentHardeningService, 
    RetryService, 
    FraudHardeningService, 
    IdempotencyService,
    PaymentGatewayFactory,
    StripeGateway,
    RazorpayGateway,
    GooglePayGateway,
    PhonePeGateway,
    PaytmGateway,
    BhimUpiGateway,
    NetBankingGateway,
    EmiGateway,
    SplitPaymentGateway,
    CashOnDeliveryGateway,
  ],
})
export class PaymentServiceModule {}

