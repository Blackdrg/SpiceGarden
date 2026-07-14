import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { StartOnboardingDto, UploadDocumentDto, VerifyDocumentDto, CalculateIncentivesDto, GenerateIncentiveDto, ApproveIncentiveDto } from './dto/driver-ops.dto';
import { DriverOnboardingService } from './driver-onboarding.service';
import { DriverPayoutService } from './driver-payout.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('deliveries:manage_assigned')
export class DriverOpsController {
  constructor(
    private onboardingService: DriverOnboardingService,
    private payoutService: DriverPayoutService,
  ) {}

  @Post('onboarding')
  async startOnboarding(@Body() body: StartOnboardingDto) {
    return this.onboardingService.startOnboarding(body.userId, body.data);
  }

  @Post('documents')
  async uploadDocument(@Body() body: UploadDocumentDto) {
    return this.onboardingService.uploadDocument(
      body.driverId,
      body.type as any,
      body.url,
      body.expiryDate ? new Date(body.expiryDate) : undefined,
    );
  }

  @Get('documents/:driverId')
  async getDocuments(@Param('driverId') driverId: string) {
    return this.onboardingService.getDocuments(driverId);
  }

  @Put('documents/:id/verify')
  async verifyDocument(@Param('id') id: string, @Body() body: VerifyDocumentDto) {
    return this.onboardingService.verifyDocument(id, body.status as any, body.notes, body.verifierId);
  }

  @Get('onboarding/:id/status')
  async getOnboardingStatus(@Param('id') id: string) {
    return this.onboardingService.getOnboardingStatus(id);
  }

  @Post('incentives/calculate')
  async calculateIncentives(@Body() body: CalculateIncentivesDto) {
    return this.payoutService.calculateWeeklyIncentives(body.driverId, new Date(body.weekStart));
  }

  @Post('incentives')
  async generateIncentive(@Body() body: GenerateIncentiveDto) {
    return this.payoutService.generateIncentive(body.driverId, body.type, body.amount, body.description);
  }

  @Put('incentives/:id/approve')
  async approveIncentive(@Param('id') id: string, @Body() body: ApproveIncentiveDto) {
    return this.payoutService.approveIncentive(id, body.approverId);
  }

  @Get('incentives/pending')
  async getPendingIncentives(@Query('driverId') driverId?: string) {
    return this.payoutService.getPendingIncentives(driverId);
  }
}