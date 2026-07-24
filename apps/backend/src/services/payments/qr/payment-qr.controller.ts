import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentQrService } from './payment-qr.service';
import { JwtAuthGuard } from '../../../security/jwt-auth.guard';
import { RolesGuard } from '../../../security/roles.guard';
import { Roles } from '../../../security/roles.decorator';
import { UserRole } from '../../../shared/domain/user.interface';

@ApiTags('payment-qr')
@ApiBearerAuth()
@Controller('payment-qr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentQrController {
  constructor(private readonly paymentQrService: PaymentQrService) {}

  @Post('create')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a QR code for UPI payment' })
  async createQr(@Body() body: { upiId: string; upiName: string; amount?: number; orderId?: string; paymentIntentId?: string; gateway?: string }) {
    return this.paymentQrService.createQrCode(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get QR code details' })
  async getQr(@Param('id') id: string) {
    return this.paymentQrService.getQrCode(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get QR code for an order' })
  async getQrByOrder(@Param('orderId') orderId: string) {
    return this.paymentQrService.getQrByOrderId(orderId);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify if QR payment was completed' })
  async verifyPayment(@Param('id') id: string) {
    return this.paymentQrService.verifyPayment(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a QR payment' })
  async cancelQr(@Param('id') id: string) {
    return this.paymentQrService.cancelQr(id);
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: 'Regenerate QR code' })
  async regenerateQr(@Param('id') id: string) {
    return this.paymentQrService.regenerateQr(id);
  }
}
