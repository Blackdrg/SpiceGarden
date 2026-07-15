import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@Controller('restaurant/subscription')
@ApiTags('Restaurant Subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  async getPlans() {
    return this.subscriptionService.getAvailablePlans();
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe restaurant to a plan' })
  async subscribe(@Body() body: { restaurantId: string; planId: string; billingCycle: string }) {
    return this.subscriptionService.subscribeRestaurant(body.restaurantId, body.planId, body.billingCycle as any);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade restaurant subscription' })
  async upgrade(@Body() body: { restaurantId: string; newPlanId: string }) {
    return this.subscriptionService.upgradeSubscription(body.restaurantId, body.newPlanId);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel restaurant subscription' })
  async cancel(@Body() body: { restaurantId: string; reason?: string }) {
    return this.subscriptionService.cancelSubscription(body.restaurantId, body.reason);
  }

  @Get(':restaurantId')
  @ApiOperation({ summary: 'Get restaurant subscription' })
  async getSubscription(@Param('restaurantId') restaurantId: string) {
    return this.subscriptionService.getSubscription(restaurantId);
  }

  @Get(':restaurantId/feature/:featureKey')
  @ApiOperation({ summary: 'Check feature access' })
  async checkFeature(@Param('restaurantId') restaurantId: string, @Param('featureKey') featureKey: string) {
    return this.subscriptionService.checkFeatureAccess(restaurantId, featureKey);
  }
}
