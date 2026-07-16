import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettlementService } from './settlement.service';
import { CreateSettlementDto, GetSettlementsQueryDto, FailSettlementDto, GetSettlementSummaryDto } from './settlement.dto';

@Controller('finance/settlements')
@ApiTags('Settlements')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  @ApiOperation({ summary: 'Create settlement report' })
  async createSettlement(@Body() settlementData: CreateSettlementDto) {
    return this.settlementService.createSettlementReport(settlementData);
  }

  @Get()
  @ApiOperation({ summary: 'Get settlement reports' })
  async getSettlements(@Query() query: GetSettlementsQueryDto) {
    return this.settlementService.getSettlementReports(query as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get settlement report' })
  async getSettlement(@Param('id') id: string) {
    return this.settlementService.getSettlementReport(id);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process settlement' })
  async processSettlement(@Param('id') id: string) {
    return this.settlementService.processSettlement(id);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark settlement as failed' })
  async failSettlement(@Param('id') id: string, @Body() body: FailSettlementDto) {
    return this.settlementService.failSettlement(id, body.reason);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry settlement' })
  async retrySettlement(@Param('id') id: string) {
    return this.settlementService.retrySettlement(id);
  }

  @Post('from-payout/:payoutId')
  @ApiOperation({ summary: 'Generate settlement from payout' })
  async generateFromPayout(@Param('payoutId') payoutId: string) {
    return this.settlementService.generatePayoutSettlement(payoutId);
  }

  @Get('summary/:restaurantId')
  @ApiOperation({ summary: 'Get settlement summary for restaurant' })
  async getSummary(@Param('restaurantId') restaurantId: string, @Query() query: GetSettlementSummaryDto) {
    return this.settlementService.getSettlementSummary(restaurantId, query.month, query.year);
  }
}
