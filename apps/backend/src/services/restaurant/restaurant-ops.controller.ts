import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RestaurantOpsService } from './restaurant-ops.service';
import { MenuModerationService } from './menu-moderation.service';
import { PayoutService } from './payout.service';
import { BranchManagementService } from './branch-management.service';
import { CommissionService } from './commission.service';
import {
  CalculateCommissionDto,
  CreateBranchDto,
  CreateCommissionRuleDto,
  GeneratePayoutDto,
  ProcessPayoutDto,
  ReviewModerationDto,
  StartOnboardingDto,
  SubmitForModerationDto,
  ToggleBranchStatusDto,
  UpdateOnboardingStepDto,
} from './restaurant-ops.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';

interface AuthenticatedRequest {
  user: { id: string; userId?: string };
}

@Controller('restaurant/ops')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('restaurants:manage_own')
export class RestaurantOpsController {
  constructor(
    private opsService: RestaurantOpsService,
    private moderationService: MenuModerationService,
    private payoutService: PayoutService,
    private branchService: BranchManagementService,
    private commissionService: CommissionService,
  ) {}

  @Post('onboarding')
  async startOnboarding(@Body() body: StartOnboardingDto) {
    return this.opsService.startOnboarding(body.userId, body.restaurantData);
  }

  @Get('onboarding/:id')
  async getOnboardingProgress(@Param('id') id: string) {
    return this.opsService.getOnboardingProgress(id);
  }

  @Put('onboarding/:id/step')
  async updateOnboardingStep(@Param('id') id: string, @Body() body: UpdateOnboardingStepDto) {
    return this.opsService.updateStep(id, body.step, body.data);
  }

  @Post('onboarding/:id/complete')
  async completeOnboarding(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.opsService.completeOnboarding(id, req.user.id);
  }

  @Post('moderation')
  async submitForModeration(@Body() body: SubmitForModerationDto) {
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
  async reviewModeration(@Param('id') id: string, @Body() body: ReviewModerationDto, @Req() req: AuthenticatedRequest) {
    return this.moderationService.reviewModeration(id, req.user.id, body.status, body.notes);
  }

  @Get('payout/history')
  async getPayoutHistory(@Query('restaurantId') restaurantId: string) {
    return this.payoutService.getPayoutHistory(restaurantId);
  }

  @Post('payout/generate')
  async generatePayout(@Body() body: GeneratePayoutDto) {
    return this.payoutService.generatePayoutReport(
      body.restaurantId,
      new Date(body.periodStart),
      new Date(body.periodEnd),
    );
  }

  @Post('payout/:id/process')
  async processPayout(@Param('id') id: string, @Body() body: ProcessPayoutDto) {
    return this.payoutService.processPayout(id, body.reference);
  }

  @Post('branch')
  async createBranch(@Body() body: CreateBranchDto) {
    return this.branchService.createBranch(body.restaurantId, body.branchData);
  }

  @Put('branch/:id')
  async updateBranch(@Param('id') id: string, @Body() body: Partial<{ branchName: string; address: string; openingTime: string; closingTime: string; lat: number; lng: number; isOnline: boolean }>) {
    return this.branchService.updateBranch(id, body);
  }

  @Put('branch/:id/status')
  async toggleBranchStatus(@Param('id') id: string, @Body() body: ToggleBranchStatusDto) {
    return this.branchService.toggleBranchStatus(id, body.isOnline);
  }

  @Get('branch/:id')
  async getBranch(@Param('id') id: string) {
    return this.branchService.getBranchDetails(id);
  }

  @Post('commission')
  async createCommissionRule(@Body() body: CreateCommissionRuleDto) {
    return this.commissionService.createCommissionRule(body.restaurantId, body.ruleData);
  }

  @Get('commission/:restaurantId')
  async getCommissionRules(@Param('restaurantId') restaurantId: string) {
    return this.commissionService.getCommissionRules(restaurantId);
  }

  @Post('commission/calculate')
  async calculateCommission(@Body() body: CalculateCommissionDto) {
    const amount = await this.commissionService.calculateCommission(
      body.restaurantId,
      body.orderAmount,
    );
    return { commissionAmount: amount };
  }
}