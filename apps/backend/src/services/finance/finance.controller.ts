import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import {
  ReconcileDriverDto,
  ReconcilePaymentsDto,
  ReconcileRestaurantDto,
  RunFullReconciliationDto,
} from './finance.dto';

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
  async reconcilePayments(@Body() body: ReconcilePaymentsDto) {
    return this.reconciliationService.reconcilePayments(
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/payouts')
  async reconcilePayouts(
    @Body() body: ReconcileRestaurantDto,
  ) {
    return this.reconciliationService.reconcilePayouts(
      body.restaurantId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/driver')
  async reconcileDriverPayments(
    @Body() body: ReconcileDriverDto,
  ) {
    return this.reconciliationService.reconcileDriverPayments(
      body.driverId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/full')
  async runFullReconciliation(@Body() body: RunFullReconciliationDto) {
    return this.reconciliationService.runFullReconciliation({
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    });
  }
}