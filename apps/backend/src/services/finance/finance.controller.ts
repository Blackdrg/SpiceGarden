import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.FINANCE_STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('finance:read')
export class FinanceController {
  constructor(
    private taxService: TaxReportingService,
    private reconciliationService: ReconciliationService,
  ) {}

  @Get('gst/report')
  async getGSTReport(
    @Query('restaurantId') restaurantId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.taxService.generateGSTReport(
      restaurantId,
      Number(month),
      Number(year),
    );
  }

  @Post('reconciliation/payments')
  async reconcilePayments(@Body() body: { startDate: string; endDate: string }) {
    return this.reconciliationService.reconcilePayments(
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/payouts')
  async reconcilePayouts(
    @Body() body: { restaurantId: string; startDate: string; endDate: string },
  ) {
    return this.reconciliationService.reconcilePayouts(
      body.restaurantId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/driver')
  async reconcileDriverPayments(
    @Body() body: { driverId: string; startDate: string; endDate: string },
  ) {
    return this.reconciliationService.reconcileDriverPayments(
      body.driverId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/full')
  async runFullReconciliation(@Body() body: { startDate: string; endDate: string }) {
    return this.reconciliationService.runFullReconciliation({
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    });
  }
}