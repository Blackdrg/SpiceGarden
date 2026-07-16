import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import {
  ApplyCouponDto,
  GenerateReferralCodeDto,
  ProcessCashbackDto,
  ProcessReferralDto,
  CreateCouponDto,
} from './loyalty.dto';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('coupons')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('orders:manage')
  @ApiOperation({ summary: 'Create a new coupon' })
  createCoupon(@Body() data: CreateCouponDto) {
    return this.loyaltyService.createCoupon(data);
  }

  @Post('coupons/apply')
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:transact_own')
  @ApiOperation({ summary: 'Apply coupon to order' })
  applyCoupon(@Body() body: ApplyCouponDto) {
    return this.loyaltyService.applyCoupon(body.code, body.userId, body.orderAmount, body.orderId);
  }

  @Get('coupons')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('orders:manage')
  @ApiOperation({ summary: 'Get all coupons' })
  getCoupons(@Query() filters: any) {
    return this.loyaltyService.getAllCoupons(filters);
  }

  @Get('coupons/:id/analytics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get coupon analytics' })
  getCouponAnalytics(@Param('id') id: string) {
    return this.loyaltyService.getCouponAnalytics(id);
  }

  @Put('coupons/:id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('orders:manage')
  @ApiOperation({ summary: 'Deactivate coupon' })
  deactivateCoupon(@Param('id') id: string) {
    return this.loyaltyService.deactivateCoupon(id);
  }

  @Post('referrals/code')
  @Roles(UserRole.CUSTOMER)
  @Permissions('orders:read_own')
  @ApiOperation({ summary: 'Generate referral code' })
  generateReferralCode(@Body() body: GenerateReferralCodeDto) {
    return this.loyaltyService.generateReferralCode(body.userId);
  }

  @Post('referrals/process')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('orders:manage')
  @ApiOperation({ summary: 'Process referral' })
  processReferral(@Body() body: ProcessReferralDto) {
    return this.loyaltyService.processReferral(body.code, body.refereeId, body.firstOrderId);
  }

  @Get('referrals/:userId')
  @Roles(UserRole.CUSTOMER)
  @Permissions('orders:read_own')
  @ApiOperation({ summary: 'Get referral history' })
  getReferralHistory(@Param('userId') userId: string) {
    return this.loyaltyService.getReferralHistory(userId);
  }

  @Post('cashback/process')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Process cashback for order' })
  processCashback(@Body() body: ProcessCashbackDto) {
    return this.loyaltyService.processCashback(body.userId, body.orderId, body.orderAmount);
  }

  @Get('cashback/:userId')
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:read_own')
  @ApiOperation({ summary: 'Get user cashback summary' })
  getWalletCashback(@Param('userId') userId: string) {
    return this.loyaltyService.getWalletCashback(userId);
  }
}
