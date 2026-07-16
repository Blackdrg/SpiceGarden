
import { Controller, Post, Body, Param, Get, UseGuards, Request, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { StripeConnectService } from './stripe-connect.service';
import { RazorpaySettlementService } from './razorpay-settlement.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { CreateStripeConnectAccountDto, CreateRazorpayFundAccountDto } from './payment-provider.dto';

@ApiTags('payment-provider')
@Controller('payment-provider')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('payments:manage')
export class PaymentProviderController {
  constructor(
    private readonly stripeConnectService: StripeConnectService,
    private readonly razorpaySettlementService: RazorpaySettlementService,
  ) {}

  @Post('stripe-connect/onboard')
  @ApiOperation({ summary: 'Create Stripe Connect account for restaurant payouts' })
  @ApiBody({ schema: { type: 'object' } })
  async createStripeConnectAccount(
    @Request() req: any,
    @Body() dto: CreateStripeConnectAccountDto
  ) {
    const restaurantId = req.user?.restaurantId || req.user?.id;
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID not found in user context');
    }

    return this.stripeConnectService.createConnectAccount(restaurantId, dto as any);
  }

  @Get('stripe-connect/status')
  @ApiOperation({ summary: 'Get Stripe Connect account status for restaurant' })
  async getStripeConnectStatus(@Request() req: any) {
    const restaurantId = req.user?.restaurantId || req.user?.id;
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID not found in user context');
    }
    return this.stripeConnectService.getAccountStatus(restaurantId);
  }

  @Post('razorpay/settlement/onboard')
  @ApiOperation({ summary: 'Create Razorpay fund account for restaurant settlements' })
  @ApiBody({ schema: { type: 'object' } })
  async createRazorpayFundAccount(
    @Request() req: any,
    @Body() dto: CreateRazorpayFundAccountDto
  ) {
    const restaurantId = req.user?.restaurantId || req.user?.id;
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID not found in user context');
    }

    return this.razorpaySettlementService.createFundAccount(restaurantId, dto as any);
  }

  @Get('razorpay/settlement/status')
  @ApiOperation({ summary: 'Get Razorpay settlement account status for restaurant' })
  async getRazorpaySettlementStatus(@Request() req: any) {
    const restaurantId = req.user?.restaurantId || req.user?.id;
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID not found in user context');
    }
    return this.razorpaySettlementService.getAccountStatus(restaurantId);
  }

  @Get('restaurant/payout-history')
  @ApiOperation({ summary: 'Get payout history from payment provider' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPayoutHistory(
    @Request() req: any,
    @Query('limit') limit?: string
  ) {
    const restaurantId = req.user?.restaurantId || req.user?.id;
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID not found in user context');
    }

    const primaryGateway = process.env.PAYMENT_PRIMARY_GATEWAY || 'stripe';
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    if (primaryGateway === 'stripe') {
      return this.stripeConnectService.getPayoutHistory(restaurantId, parsedLimit);
    } else if (primaryGateway === 'razorpay') {
      return this.razorpaySettlementService.getSettlementHistory(restaurantId, parsedLimit);
    }

    throw new BadRequestException(`Unsupported payment gateway: ${primaryGateway}`);
  }

  @Get('restaurant/balance')
  @ApiOperation({ summary: 'Get current balance from payment provider' })
  async getAccountBalance(@Request() req: any) {
    const restaurantId = req.user?.restaurantId || req.user?.id;
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID not found in user context');
    }

    const primaryGateway = process.env.PAYMENT_PRIMARY_GATEWAY || 'stripe';

    if (primaryGateway === 'stripe') {
      return this.stripeConnectService.getAccountBalance(restaurantId);
    } else if (primaryGateway === 'razorpay') {
      return this.razorpaySettlementService.getAccountBalance(restaurantId);
    }

    return { available: 0, pending: 0, currency: 'INR' };
  }
}
