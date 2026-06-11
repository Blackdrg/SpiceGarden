import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "./db/db.module";
import { SecurityModule } from "./security/security.module";
import { LoggingModule } from "./logging/logging.module";
import { QueueModule } from "./infra/queue/queue.module";
import { TrackingModule } from "./infra/tracking/tracking.module";

import { AuthServiceModule } from "./services/auth/auth.module";
import { OrderServiceModule } from "./services/order/order.module";
import { PaymentServiceModule } from "./services/payments/payments.module";
import { RestaurantServiceModule } from "./services/restaurant/restaurant.module";
import { SearchServiceModule } from "./services/search/search.module";
import { DeliveryServiceModule } from "./services/delivery/delivery.module";
import { DriverOpsModule } from "./services/delivery/driver-ops.module";
import { AdminServiceModule } from "./services/admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", ".env.local"] }),
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
  ],
})
export class AppHttpModule {}
