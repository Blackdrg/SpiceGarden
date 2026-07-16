import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeliveryPricingService } from './delivery-pricing.service';
import { CalculateDeliveryFeeDto, CreatePricingRuleDto, UpdatePricingRuleDto } from './delivery-pricing.dto';

@Controller('delivery/pricing')
@ApiTags('Delivery Pricing')
export class DeliveryPricingController {
  constructor(private readonly deliveryPricingService: DeliveryPricingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate delivery fee' })
  async calculate(
    @Body() body: CalculateDeliveryFeeDto,
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
  async createRule(@Body() ruleData: CreatePricingRuleDto) {
    return this.deliveryPricingService.createPricingRule(ruleData);
  }

  @Put('rules/:ruleId')
  @ApiOperation({ summary: 'Update pricing rule' })
  async updateRule(@Param('ruleId') ruleId: string, @Body() updateData: UpdatePricingRuleDto) {
    return this.deliveryPricingService.updatePricingRule(ruleId, updateData);
  }
}
