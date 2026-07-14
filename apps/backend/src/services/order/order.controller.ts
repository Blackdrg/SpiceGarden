import { Controller, Post, Body, Headers, UseGuards, Request, Get, Query, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async placeOrder(
    @Body() body: PlaceOrderDto,
    @Headers('x-idempotency-key') idempotencyKey?: string
  ) {
    return this.orderService.placeOrder(body, idempotencyKey);
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DELIVERY_PARTNER)
  async getOrder(@Param('id') orderId: string) {
    return this.orderService.getOrderWithDetails(orderId);
  }
}
