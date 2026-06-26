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
import { MetricsModule } from './metrics/metrics.module';
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
import { ApisModule } from './apis.module';

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
    MetricsModule,
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
    ApisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

