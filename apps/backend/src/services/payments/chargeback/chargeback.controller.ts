
import { Controller, Get, Post, Param, Body, Patch, UseGuards, Query, HttpCode, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { ChargebackService } from './chargeback.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../../security/jwt-auth.guard';
import { RolesGuard } from '../../../security/roles.guard';
import { Roles } from '../../../security/roles.decorator';
import { UserRole } from '../../../shared/domain/user.interface';

@ApiTags('chargebacks')
@Controller('chargebacks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChargebackController {
  constructor(private readonly chargebackService: ChargebackService) {}

  @Get(':disputeId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF, UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get chargeback dispute by ID' })
  @ApiResponse({ status: 200, description: 'Chargeback dispute retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chargeback dispute not found' })
  @ApiParam({ name: 'disputeId', type: 'string' })
  async getDisputeById(
    @Param('disputeId') disputeId: string
  ) {
    return await this.chargebackService.getDisputeById(disputeId);
  }

  @Get('order/:orderId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF, UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get chargeback disputes for an order' })
  @ApiResponse({ status: 200, description: 'Chargeback disputes retrieved successfully' })
  @ApiParam({ name: 'orderId', type: 'string' })
  async getDisputesForOrder(
    @Param('orderId') orderId: string
  ) {
    return await this.chargebackService.getDisputesForOrder(orderId);
  }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
    @HttpCode(HttpStatus.OK)
   async getDisputes(
     @Query('status') status?: string,
     @Query('startDate') startDate?: string,
     @Query('endDate') endDate?: string
   ) {
     const start = startDate ? new Date(startDate) : undefined;
     const end = endDate ? new Date(endDate) : undefined;
     
     if (status) {
       // Validate that status is one of the allowed values
       const validStatuses = ['warning', 'needs_response', 'under_review', 'won', 'lost'] as const;
       if (!validStatuses.includes(status as any)) {
         throw new BadRequestException(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
       }
       return await this.chargebackService.getDisputesByStatus(status as 'warning' | 'needs_response' | 'under_review' | 'won' | 'lost');
     }
     
     // If dates are provided, get stats
     if (startDate || endDate) {
       return await this.chargebackService.getDisputeStats(start, end);
     }
     
     // Default to pending disputes
     return await this.chargebackService.getDisputesByStatus('under_review');
   }

  @Post(':disputeId/initiate-refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate refund for a won chargeback dispute' })
  @ApiResponse({ status: 200, description: 'Refund initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Chargeback dispute not found' })
  @ApiParam({ name: 'disputeId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        processedBy: { type: 'string' },
        gateway: { type: 'string' }
      },
      required: ['processedBy']
    }
  })
  // TODO: Implement initiateRefundForWonDispute in ChargebackService
  // async initiateRefundForWonDispute()

  @Get('stats/overview')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get chargeback statistics overview' })
  @ApiResponse({ status: 200, description: 'Chargeback statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', type: 'string', required: false })
  @ApiQuery({ name: 'endDate', type: 'string', required: false })
  async getDisputeStatsOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.chargebackService.getDisputeStats(start, end);
  }
}

