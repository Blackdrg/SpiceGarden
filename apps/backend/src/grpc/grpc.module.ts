import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth.controller';
import { OrderGrpcController } from './order.controller';
import { AuthServiceModule } from '../services/auth/auth.module';
import { OrderServiceModule } from '../services/order/order.module';

@Module({
  imports: [
    AuthServiceModule,
    OrderServiceModule,
  ],
  controllers: [AuthGrpcController, OrderGrpcController],
  providers: [],
  exports: [],
})
export class GrpcModule {}
