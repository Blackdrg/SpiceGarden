import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { SecurityModule } from './security/security.module';
import { LoggingModule } from './logging/logging.module';
import { QueueModule } from './infra/queue/queue.module';
import { TrackingModule } from './infra/tracking/tracking.module';
import { AuthServiceModule } from './services/auth/auth.module';
import { OrderServiceModule } from './services/order/order.module';
import { PaymentServiceModule } from './services/payments/payments.module';
import { RestaurantServiceModule } from './services/restaurant/restaurant.module';
import { SearchServiceModule } from './services/search/search.module';
import { DeliveryServiceModule } from './services/delivery/delivery.module';
import { DriverOpsModule } from './services/delivery/driver-ops.module';
import { AdminServiceModule } from './services/admin/admin.module';
import { NotificationModule } from './services/notifications/notification.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { DriverAssignmentModule } from './modules/driver-assignment/driver-assignment.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AuditModule } from './audit/audit.module';
import { WalletModule } from './services/wallet/wallet.module';
import { GSTModule } from './services/gst/gst.module';
import { FinanceModule } from './services/finance/finance.module';
import { SupportModule } from './services/support/support.module';
import { RefundModule } from './services/refund/refund.module';
import { LoyaltyModule } from './services/loyalty/loyalty.module';
import { DriverFleetModule } from './services/driver-fleet/driver-fleet.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReviewServiceModule } from './services/review/review.module';
import { UserProfileModule } from './services/user/user-profile.module';
import { UserModule } from './services/users/user.module';
import { ApisModule } from './apis.module';
import { SubscriptionModule } from './services/restaurant/subscription.module';
import { CustomerSubscriptionModule } from './services/customer/customer-subscription.module';
import { DeliveryPricingModule } from './services/delivery/delivery-pricing.module';
import { PlatformFeeModule } from './services/finance/platform-fee.module';
import { AccountingModule } from './services/finance/accounting.module';
import { CampaignModule } from './services/marketing/campaign.module';
import { TenantModule } from './services/tenant/tenant.module';
import { ApiKeyModule } from './services/enterprise/api-key.module';
import { BankAccountModule } from './services/finance/bank-account.module';
import { SettlementModule } from './services/finance/settlement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '../../.env'), path.resolve(process.cwd(), '.env')],
    }),
    DbModule,
    SecurityModule,
    LoggingModule,
    QueueModule,
    TrackingModule,
    AuthServiceModule,
    OrderServiceModule,
    PaymentServiceModule,
    RestaurantServiceModule,
    SearchServiceModule,
    DeliveryServiceModule,
    DriverOpsModule,
    AdminServiceModule,
    NotificationModule,
    KitchenModule,
    DriverAssignmentModule,
    ComplianceModule,
    AuditModule,
    WalletModule,
    GSTModule,
    FinanceModule,
    SupportModule,
    RefundModule,
    LoyaltyModule,
    DriverFleetModule,
    AnalyticsModule,
    ReviewServiceModule,
    UserProfileModule,
    UserModule,
    ApisModule,
    SubscriptionModule,
    CustomerSubscriptionModule,
    DeliveryPricingModule,
    PlatformFeeModule,
    AccountingModule,
    CampaignModule,
    TenantModule,
    ApiKeyModule,
    BankAccountModule,
    SettlementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

