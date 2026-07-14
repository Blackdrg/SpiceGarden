import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomerSupportService } from './customer-support.service';
import { TicketRoutingService } from './ticket-routing.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { DisputeStatus } from '../../db/entities/dispute.entity';
import {
  EscalateTicketDto,
  ProcessRefundDto,
  RaiseDisputeDto,
  RequestRefundDto,
  ReviewDisputeDto,
} from './support.dto';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_STAFF)
@Permissions('support:manage')
export class SupportController {
  constructor(
    private supportService: CustomerSupportService,
    private routingService: TicketRoutingService,
  ) {}

  @Post('disputes')
  async raiseDispute(@Body() body: RaiseDisputeDto) {
    return this.supportService.raiseDispute(body.orderId, body.customerId, body.type, body.description);
  }

  @Get('disputes')
  async getDisputes(@Query() query: { status?: DisputeStatus; customerId?: string; restaurantId?: string; driverId?: string }) {
    return this.supportService.getDisputes(query);
  }

  @Put('disputes/:id/review')
  async reviewDispute(@Param('id') id: string, @Body() body: ReviewDisputeDto) {
    return this.supportService.reviewDispute(id, body.reviewerId, body.status, body.notes);
  }

  @Post('refunds')
  async requestRefund(@Body() body: RequestRefundDto) {
    return this.supportService.requestRefund(body.orderId, body.requestedBy, body.type, body.amount, body.reason);
  }

  @Put('refunds/:id/process')
  async processRefund(@Param('id') id: string, @Body() body: ProcessRefundDto) {
    return this.supportService.processRefund(id, body.processedBy, body.paymentReference);
  }

  @Get('tickets/stats')
  async getQueueStats() {
    return this.routingService.getQueueStats();
  }

  @Post('tickets/:id/route')
  async routeTicket(@Param('id') id: string) {
    return this.routingService.routeTicket(id);
  }

  @Post('tickets/:id/escalate')
  async escalateTicket(@Param('id') id: string, @Body() body: EscalateTicketDto) {
    return this.routingService.escalateTicket(id, body.level || 1);
  }
}