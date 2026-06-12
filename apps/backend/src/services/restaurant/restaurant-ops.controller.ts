import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RestaurantOpsService } from './restaurant-ops.service';
import { OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { MenuModerationService } from './menu-moderation.service';
import { ModerationStatus, ModerationAction } from '../../db/entities/menu-moderation.entity';
import { PayoutService } from './payout.service';
import { BranchManagementService } from './branch-management.service';
import { CommissionService } from './commission.service';
import { CommissionType } from '../../db/entities/commission-rule.entity';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

interface AuthenticatedRequest {
  user: { id: string; userId?: string };
}

@Controller('restaurant/ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT, UserRole.ADMIN)
export class RestaurantOpsController {
  constructor(
    private opsService: RestaurantOpsService,
    private moderationService: MenuModerationService,
    private payoutService: PayoutService,
    private branchService: BranchManagementService,
    private commissionService: CommissionService,
  ) {}

  @Post('onboarding')
  async startOnboarding(@Body() body: { userId: string; restaurantData: { name: string; slug: string; description?: string; businessDetails?: any } }) {
    return this.opsService.startOnboarding(body.userId, body.restaurantData);
  }

  @Get('onboarding/:id')
  async getOnboardingProgress(@Param('id') id: string) {
    return this.opsService.getOnboardingProgress(id);
  }

  @Put('onboarding/:id/step')
  async updateOnboardingStep(@Param('id') id: string, @Body() body: { step: OnboardingStep; data?: any }) {
    return this.opsService.updateStep(id, body.step, body.data);
  }

  @Post('onboarding/:id/complete')
  async completeOnboarding(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.opsService.completeOnboarding(id, req.user.id);
  }

  @Post('moderation')
  async submitForModeration(@Body() body: { menuItemId: string; restaurantId: string; action: ModerationAction; data: Record<string, any>; originalData?: Record<string, any> }) {
    return this.moderationService.submitForModeration(
      body.menuItemId,
      body.restaurantId,
      body.action,
      body.data,
      body.originalData,
    );
  }

  @Get('moderation/pending')
  async getPendingModerations(@Query('restaurantId') restaurantId?: string) {
    return this.moderationService.getPendingModerations(restaurantId);
  }

  @Put('moderation/:id/review')
  async reviewModeration(@Param('id') id: string, @Body() body: { status: ModerationStatus; notes?: string }, @Req() req: AuthenticatedRequest) {
    return this.moderationService.reviewModeration(id, req.user.id, body.status, body.notes);
  }

  @Get('payout/history')
  async getPayoutHistory(@Query('restaurantId') restaurantId: string) {
    return this.payoutService.getPayoutHistory(restaurantId);
  }

  @Post('payout/generate')
  async generatePayout(@Body() body: { restaurantId: string; periodStart: string; periodEnd: string }) {
    return this.payoutService.generatePayoutReport(
      body.restaurantId,
      new Date(body.periodStart),
      new Date(body.periodEnd),
    );
  }

  @Post('payout/:id/process')
  async processPayout(@Param('id') id: string, @Body() body: { reference: string }) {
    return this.payoutService.processPayout(id, body.reference);
  }

  @Post('branch')
  async createBranch(@Body() body: { restaurantId: string; branchData: { branchName: string; address: string; lat: number; lng: number; openingTime?: string; closingTime?: string } }) {
    return this.branchService.createBranch(body.restaurantId, body.branchData);
  }

  @Put('branch/:id')
  async updateBranch(@Param('id') id: string, @Body() body: Partial<{ branchName: string; address: string; openingTime: string; closingTime: string; lat: number; lng: number; isOnline: boolean }>) {
    return this.branchService.updateBranch(id, body);
  }

  @Put('branch/:id/status')
  async toggleBranchStatus(@Param('id') id: string, @Body() body: { isOnline: boolean }) {
    return this.branchService.toggleBranchStatus(id, body.isOnline);
  }

  @Get('branch/:id')
  async getBranch(@Param('id') id: string) {
    return this.branchService.getBranchDetails(id);
  }

  @Post('commission')
  async createCommissionRule(@Body() body: { restaurantId: string; ruleData: { type: CommissionType; value: number; minOrderValue?: number; maxOrderValue?: number; validFrom?: Date; validTo?: Date; applicableCategories?: string[] } }) {
    return this.commissionService.createCommissionRule(body.restaurantId, body.ruleData);
  }

  @Get('commission/:restaurantId')
  async getCommissionRules(@Param('restaurantId') restaurantId: string) {
    return this.commissionService.getCommissionRules(restaurantId);
  }

  @Post('commission/calculate')
  async calculateCommission(@Body() body: { restaurantId: string; orderAmount: number }) {
    const amount = await this.commissionService.calculateCommission(
      body.restaurantId,
      body.orderAmount,
    );
    return { commissionAmount: amount };
  }
}