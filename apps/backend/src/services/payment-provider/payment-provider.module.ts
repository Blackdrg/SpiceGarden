import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeConnectService } from './stripe-connect.service';
import { RazorpaySettlementService } from './razorpay-settlement.service';
import { DriverPayoutProviderService } from './driver-payout-provider.service';
import { PaymentProviderController } from './payment-provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { OrderEntity } from '../../db/entities/order.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      RestaurantEntity,
      PayoutReportEntity,
      DriverEntity,
      DriverIncentiveEntity,
      OrderEntity,
    ]),
  ],
  providers: [
    StripeConnectService,
    RazorpaySettlementService,
    DriverPayoutProviderService,
  ],
  controllers: [
    PaymentProviderController,
  ],
  exports: [
    StripeConnectService,
    RazorpaySettlementService,
    DriverPayoutProviderService,
  ],
})
export class PaymentProviderModule {}
