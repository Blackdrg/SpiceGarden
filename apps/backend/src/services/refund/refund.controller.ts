
import { Controller, Post, Get, Body, Param, Patch, UseGuards, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundRequestType } from './refund.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { type Request } from 'express';

@ApiTags('refunds')
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post('request')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a refund request' })
  @ApiResponse({ status: 200, description: 'Refund request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order or user not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        requestedBy: { type: 'string' },
        amount: { type: 'number' },
        reason: { type: 'string' },
        requestType: { type: 'string', enum: ['customer_request', 'agent_initiated', 'policy_exception', 'dispute_resolution'] }
      },
      required: ['orderId', 'requestedBy', 'amount', 'reason']
    }
  })
  async createRefundRequest(
    @Body() body: any
  ) {
    return await this.refundService.createRefundRequest(
      body.orderId,
      body.requestedBy,
      body.amount,
      body.reason,
      body.requestType || RefundRequestType.CUSTOMER_REQUEST
    );
  }

  @Patch(':approvalId/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a refund request' })
  @ApiResponse({ status: 200, description: 'Refund request approved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  @ApiParam({ name: 'approvalId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approverId: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['approverId']
    }
  })
  async approveRefundRequest(
    @Param('approvalId') approvalId: string,
    @Body() body: any
  ) {
    return await this.refundService.approveRefundRequest(
      approvalId,
      body.approverId,
      body.notes
    );
  }

  @Patch(':approvalId/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a refund request' })
  @ApiResponse({ status: 200, description: 'Refund request rejected successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  @ApiParam({ name: 'approvalId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approverId: { type: 'string' },
        reason: { type: 'string' }
      },
      required: ['approverId', 'reason']
    }
  })
  async rejectRefundRequest(
    @Param('approvalId') approvalId: string,
    @Body() body: any
  ) {
    return await this.refundService.rejectRefundRequest(
      approvalId,
      body.approverId,
      body.reason
    );
  }

  @Post(':approvalId/process')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process an approved refund' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  @ApiParam({ name: 'approvalId', type: 'string' })
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
  async processRefund(
    @Param('approvalId') approvalId: string,
    @Body() body: any
  ) {
    return await this.refundService.processRefund(
      approvalId,
      body.processedBy,
      body.gateway
    );
  }

  @Get(':approvalId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF, UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get refund request by ID' })
  @ApiResponse({ status: 200, description: 'Refund request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  @ApiParam({ name: 'approvalId', type: 'string' })
  async getRefundRequest(
    @Param('approvalId') approvalId: string
  ) {
    return await this.refundService.getRefundRequest(approvalId);
  }

  @Get('order/:orderId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF, UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get refund requests for an order' })
  @ApiResponse({ status: 200, description: 'Refund requests retrieved successfully' })
  @ApiParam({ name: 'orderId', type: 'string' })
  async getRefundRequestsForOrder(
    @Param('orderId') orderId: string
  ) {
    return await this.refundService.getRefundRequestsForOrder(orderId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get refund requests by status' })
  @ApiResponse({ status: 200, description: 'Refund requests retrieved successfully' })
   @ApiQuery({ name: 'status', type: 'string', required: false })
   async getRefundRequestsByStatus(
     @Query('status') status?: string
   ) {
     if (status) {
       // Validate that status is one of the allowed values
       const validStatuses = ['pending', 'approved', 'rejected', 'processed', 'failed'] as const;
       if (!validStatuses.includes(status as any)) {
         throw new BadRequestException(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
       }
       return await this.refundService.getRefundRequestsByStatus(status as 'pending' | 'approved' | 'rejected' | 'processed' | 'failed');
     }
     // Return all requests if no status specified
     return await this.refundService.getRefundRequestsByStatus('pending');
   }
}

