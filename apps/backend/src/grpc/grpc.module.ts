import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth.controller';
import { OrderGrpcController } from './order.controller';
import { AuthService } from '../services/auth/auth.service';
import { OrderService } from '../services/order/order.service';

@Module({
  imports: [],
  controllers: [AuthGrpcController, OrderGrpcController],
  providers: [AuthService, OrderService],
  exports: [],
})
export class GrpcModule {}
