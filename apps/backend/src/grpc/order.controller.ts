import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from '../../services/order/order.service';

@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'PlaceOrder')
  async placeOrder(data: any) {
    return this.orderService.placeOrder(data, data.idempotency_key);
  }
}
