import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "../db/db.module";
import { SecurityModule } from "../security/security.module";
import { LoggingModule } from "../logging/logging.module";
import { QueueModule } from "../infra/queue/queue.module";
import { TrackingModule } from "../infra/tracking/tracking.module";
import { AuthServiceModule } from "../services/auth/auth.module";
import { AuthGrpcController } from "./auth.controller";
import { OrderGrpcController } from "./order.controller";
import { OrderService } from "../services/order/order.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", ".env.local"] }),
    DbModule,
    SecurityModule,
    LoggingModule,
    QueueModule,
    TrackingModule,
    AuthServiceModule,
    OrderService,
  ],
  controllers: [AuthGrpcController, OrderGrpcController],
  providers: [],
})
export class AppGrpcModule {}
