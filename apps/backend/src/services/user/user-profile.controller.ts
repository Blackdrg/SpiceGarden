import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

interface AddressCreateBody {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  location: { lat: number; lng: number };
  isDefault?: boolean;
}

interface PaymentMethodCreateBody {
  type: 'card' | 'upi' | 'wallet';
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  upiId?: string;
  walletProvider?: string;
  externalPaymentMethodId?: string;
  isDefault?: boolean;
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Get('addresses')
  async getAddresses(@Req() req: any) {
    const userId = req.user?.sub;
    return this.profileService.getAddresses(userId);
  }

  @Post('addresses')
  async createAddress(@Req() req: any, @Body() body: AddressCreateBody) {
    const userId = req.user?.sub;
    return this.profileService.createAddress(userId, body);
  }

  @Put('addresses/:id')
  async updateAddress(@Req() req: any, @Param('id') id: string, @Body() body: Partial<AddressCreateBody>) {
    const userId = req.user?.sub;
    return this.profileService.updateAddress(userId, id, body);
  }

  @Delete('addresses/:id')
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub;
    return this.profileService.deleteAddress(userId, id);
  }

  @Get('payment-methods')
  async getPaymentMethods(@Req() req: any) {
    const userId = req.user?.sub;
    return this.profileService.getPaymentMethods(userId);
  }

  @Post('payment-methods')
  async createPaymentMethod(@Req() req: any, @Body() body: PaymentMethodCreateBody) {
    const userId = req.user?.sub;
    return this.profileService.createPaymentMethod(userId, body);
  }

  @Delete('payment-methods/:id')
  async deletePaymentMethod(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub;
    return this.profileService.deletePaymentMethod(userId, id);
  }

  @Put('payment-methods/:id/set-default')
  async setDefaultPaymentMethod(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub;
    return this.profileService.setDefaultPaymentMethod(userId, id);
  }
}