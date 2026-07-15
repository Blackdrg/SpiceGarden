import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeliveryPricingService } from './delivery-pricing.service';

@Controller('delivery/pricing')
@ApiTags('Delivery Pricing')
export class DeliveryPricingController {
  constructor(private readonly deliveryPricingService: DeliveryPricingService) {}

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate delivery fee' })
  async calculate(
    @Body() body: {
      restaurantId: string;
      distanceKm: number;
      durationMinutes: number;
      weatherCondition?: string;
      isHoliday?: boolean;
    }
  ) {
    return this.deliveryPricingService.calculateDeliveryFee(
      body.restaurantId,
      body.distanceKm,
      body.durationMinutes,
      body.weatherCondition,
      body.isHoliday,
    );
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all pricing rules' })
  async getRules() {
    return this.deliveryPricingService.getPricingRules();
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create pricing rule' })
  async createRule(@Body() ruleData: any) {
    return this.deliveryPricingService.createPricingRule(ruleData);
  }

  @Put('rules/:ruleId')
  @ApiOperation({ summary: 'Update pricing rule' })
  async updateRule(@Param('ruleId') ruleId: string, @Body() updateData: any) {
    return this.deliveryPricingService.updatePricingRule(ruleId, updateData);
  }
}
