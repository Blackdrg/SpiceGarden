import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlatformFeeService, FeeApplicableTo } from './platform-fee.service';
import { CreateFeeDto, UpdateFeeDto, CalculateFeeDto } from './platform-fee.dto';

@Controller('finance/platform-fee')
@ApiTags('Platform Fees')
export class PlatformFeeController {
  constructor(private readonly platformFeeService: PlatformFeeService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate platform fee' })
  async calculate(@Body() body: CalculateFeeDto) {
    return this.platformFeeService.calculateFee(body.applicableTo as FeeApplicableTo, body.amount, body.cityCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get all platform fees' })
  async getFees(@Query('applicableTo') applicableTo?: string) {
    return this.platformFeeService.getFees(applicableTo as FeeApplicableTo | undefined);
  }

  @Post()
  @ApiOperation({ summary: 'Create platform fee' })
  async createFee(@Body() feeData: CreateFeeDto) {
    return this.platformFeeService.createFee(feeData as any);
  }

  @Put(':feeId')
  @ApiOperation({ summary: 'Update platform fee' })
  async updateFee(@Param('feeId') feeId: string, @Body() updateData: UpdateFeeDto) {
    return this.platformFeeService.updateFee(feeId, updateData as any);
  }
}
