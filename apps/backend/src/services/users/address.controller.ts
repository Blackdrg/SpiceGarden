import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getAddresses(@Req() req: any) {
    const userId = req.user?.sub;
    return this.addressService.getUserAddresses(userId);
  }

  @Post()
  async addAddress(@Req() req: any, @Body() data: any) {
    const userId = req.user?.sub;
    return this.addressService.addAddress(userId, data);
  }

  @Put(':id/default')
  async setDefault(@Req() req: any, @Param('id') addressId: string) {
    const userId = req.user?.sub;
    return this.addressService.setDefault(userId, addressId);
  }

  @Delete(':id')
  async deleteAddress(@Req() req: any, @Param('id') addressId: string) {
    const userId = req.user?.sub;
    return this.addressService.deleteAddress(userId, addressId);
  }
}