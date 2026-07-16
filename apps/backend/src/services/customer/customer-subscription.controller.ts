import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomerSubscriptionService } from './customer-subscription.service';
import { SubscribeCustomerDto, CancelCustomerSubscriptionDto } from './customer-subscription.dto';

@Controller('customer/subscription')
@ApiTags('Customer Subscription')
export class CustomerSubscriptionController {
  constructor(private readonly customerSubscriptionService: CustomerSubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available Prime plans' })
  async getPlans() {
    return this.customerSubscriptionService.getPrimePlans();
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe customer to Prime' })
  async subscribe(@Body() body: SubscribeCustomerDto) {
    return this.customerSubscriptionService.subscribeCustomer(body.userId, body.planId, body.billingCycle as any);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel Prime subscription' })
  async cancel(@Body() body: CancelCustomerSubscriptionDto) {
    return this.customerSubscriptionService.cancelSubscription(body.userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get customer subscription' })
  async getSubscription(@Param('userId') userId: string) {
    return this.customerSubscriptionService.getSubscription(userId);
  }

  @Get(':userId/benefits')
  @ApiOperation({ summary: 'Get Prime benefits' })
  async getBenefits(@Param('userId') userId: string) {
    return this.customerSubscriptionService.getPrimeBenefits(userId);
  }
}
