import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomerSupportService } from './customer-support.service';
import { TicketRoutingService } from './ticket-routing.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { DisputeType, DisputeStatus } from '../../db/entities/dispute.entity';
import { RefundType } from '../../db/entities/refund.entity';

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
  async raiseDispute(@Body() body: { orderId: string; customerId: string; type: DisputeType; description: string }) {
    return this.supportService.raiseDispute(body.orderId, body.customerId, body.type, body.description);
  }

  @Get('disputes')
  async getDisputes(@Query() query: { status?: DisputeStatus; customerId?: string; restaurantId?: string; driverId?: string }) {
    return this.supportService.getDisputes(query);
  }

  @Put('disputes/:id/review')
  async reviewDispute(@Param('id') id: string, @Body() body: { reviewerId: string; status: DisputeStatus; notes?: string }) {
    return this.supportService.reviewDispute(id, body.reviewerId, body.status, body.notes);
  }

  @Post('refunds')
  async requestRefund(@Body() body: { orderId: string; requestedBy: string; type: RefundType; amount: number; reason: string }) {
    return this.supportService.requestRefund(body.orderId, body.requestedBy, body.type, body.amount, body.reason);
  }

  @Put('refunds/:id/process')
  async processRefund(@Param('id') id: string, @Body() body: { processedBy: string; paymentReference?: string }) {
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
  async escalateTicket(@Param('id') id: string, @Body() body: { level?: number }) {
    return this.routingService.escalateTicket(id, body.level || 1);
  }
}