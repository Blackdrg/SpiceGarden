import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentService: PaymentMethodsService) {}

  @Get()
  async getPaymentMethods(@Req() req: any) {
    const userId = req.user?.sub;
    return this.paymentService.getUserPaymentMethods(userId);
  }

  @Post()
  async addPaymentMethod(@Req() req: any, @Body() data: any) {
    const userId = req.user?.sub;
    return this.paymentService.addPaymentMethod(userId, data);
  }

  @Put(':id/default')
  async setDefault(@Req() req: any, @Param('id') paymentId: string) {
    const userId = req.user?.sub;
    return this.paymentService.setDefault(userId, paymentId);
  }

  @Delete(':id')
  async deletePaymentMethod(@Req() req: any, @Param('id') paymentId: string) {
    const userId = req.user?.sub;
    return this.paymentService.deletePaymentMethod(userId, paymentId);
  }
}