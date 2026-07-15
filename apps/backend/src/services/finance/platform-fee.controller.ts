import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlatformFeeService, FeeApplicableTo } from './platform-fee.service';

@Controller('finance/platform-fee')
@ApiTags('Platform Fees')
export class PlatformFeeController {
  constructor(private readonly platformFeeService: PlatformFeeService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate platform fee' })
  async calculate(@Body() body: { applicableTo: string; amount: number; cityCode?: string }) {
    return this.platformFeeService.calculateFee(body.applicableTo as FeeApplicableTo, body.amount, body.cityCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get all platform fees' })
  async getFees(@Body('applicableTo') applicableTo?: string) {
    return this.platformFeeService.getFees(applicableTo as FeeApplicableTo | undefined);
  }

  @Post()
  @ApiOperation({ summary: 'Create platform fee' })
  async createFee(@Body() feeData: any) {
    return this.platformFeeService.createFee(feeData);
  }

  @Put(':feeId')
  @ApiOperation({ summary: 'Update platform fee' })
  async updateFee(@Param('feeId') feeId: string, @Body() updateData: any) {
    return this.platformFeeService.updateFee(feeId, updateData);
  }
}
