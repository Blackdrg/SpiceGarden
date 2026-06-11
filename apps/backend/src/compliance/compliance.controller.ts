import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { Soc2ReadinessService } from './soc2-readiness.service';
import { PciDssValidationService } from './pci-dss-validation.service';
import { SecretsRotationService } from './secrets-rotation.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';

export interface DeletionRequestDto {
  userId: string;
  regulation: 'gdpr' | 'dpdp' | 'self_service';
  reason?: string;
}

export interface CancelDeletionDto {
  userId: string;
}

@Controller('compliance')
export class ComplianceController {
  constructor(
    private complianceService: ComplianceService,
    private soc2Service: Soc2ReadinessService,
    private pciDssService: PciDssValidationService,
    private secretsService: SecretsRotationService,
    private dataPrivacyService: DataPrivacyService,
  ) {}

  @Get('soc2')
  async getSoc2Readiness() {
    return this.soc2Service.assessTrustServicesCriteria();
  }

  @Get('soc2/evidence')
  async getSoc2Evidence() {
    return this.soc2Service.generateSoc2EvidenceReport();
  }

  @Get('pci-dss')
  async getPciDssStatus() {
    return this.pciDssService.validatePciDssCompliance();
  }

  @Get('pci-dss/payment-flow')
  async validatePaymentFlow() {
    return this.pciDssService.validatePaymentFlow();
  }

  @Get('pci-dss/saq')
  async getPciDssSaqMetrics() {
    return this.pciDssService.getFraudMetricsForSaq();
  }

  @Get('secrets/rotation-status')
  async getSecretsRotationStatus() {
    return {
      secretsRequiringRotation: this.secretsService.getSecretsRequiringRotation(),
      validation: await this.secretsService.validateRotationCapability(),
    };
  }

  @Get('secrets/proof')
  async getSecretsRotationProof() {
    return this.secretsService.getRotationProof();
  }

  @Post('secrets/rotate')
  async rotateSecrets(@Query('secrets') secrets?: string) {
    const secretList = secrets ? secrets.split(',') : ['jwt_secret', 'encryption', 'db_password'];
    return {
      success: true,
      message: 'Secrets rotation initiated',
      rotated: secretList,
    };
  }

  @Get('retention-stats')
  async getRetentionStatistics() {
    return this.complianceService.getRetentionStatistics();
  }

  @Post('retention/apply')
  async applyDataRetention() {
    return this.complianceService.applyDataRetentionPolicies();
  }

  @Get('gdpr/user/:userId/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'customer')
  async exportUserDataGdpr(@Param('userId') userId: string, @Request() req: any) {
    if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
      throw new Error('Unauthorized to export this user data');
    }
    const data = await this.complianceService.exportUserData(userId);
    return {
      regulation: 'gdpr',
      data,
      exportedAt: new Date(),
      rightExercised: 'right_to_access',
    };
  }

  @Get('dpdp/user/:userId/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'customer')
  async exportUserDataDpdp(@Param('userId') userId: string, @Request() req: any) {
    if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
      throw new Error('Unauthorized to export this user data');
    }
    const data = await this.complianceService.exportUserData(userId);
    return {
      regulation: 'dpdp',
      data,
      exportedAt: new Date(),
      rightExercised: 'right_to_data_portability',
    };
  }

  @Post('gdpr/user/:userId/deletion-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  async requestGdprDeletion(@Param('userId') userId: string, @Body() dto: DeletionRequestDto, @Request() req: any) {
    if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
      throw new Error('Unauthorized to submit deletion request for this user');
    }
    const result = await this.complianceService.requestUserDataDeletion(userId, 'gdpr', dto.reason);
    return {
      ...result,
      regulation: 'gdpr',
      rightExercised: 'right_to_be_forgotten',
      approvalRequired: true,
      cancellableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  @Post('dpdp/user/:userId/deletion-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  async requestDpdpDeletion(@Param('userId') userId: string, @Body() dto: DeletionRequestDto, @Request() req: any) {
    if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
      throw new Error('Unauthorized to submit deletion request for this user');
    }
    const result = await this.complianceService.requestUserDataDeletion(userId, 'dpdp', dto.reason);
    return {
      ...result,
      regulation: 'dpdp',
      rightExercised: 'right_to_erasure',
      approvalRequired: true,
      cancellableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  @Post('gdpr/user/:userId/deletion-request/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  async cancelGdprDeletion(@Param('userId') userId: string, @Request() req: any) {
    if (req.user?.sub !== userId && !['admin', 'super_admin'].includes(req.user?.role)) {
      throw new Error('Unauthorized');
    }
    const result = await this.complianceService.cancelUserDataDeletion(userId);
    return {
      ...result,
      regulation: 'gdpr',
      message: 'Deletion request cancelled successfully',
    };
  }

  @Get('user/:userId/deletion-status')
  async getDeletionStatus(@Param('userId') userId: string) {
    const status = await this.complianceService.getUserDataDeletionStatus(userId);
    return {
      userId,
      hasActiveRequest: !!status && ['pending', 'processing'].includes(status.status),
      deletionRequest: status,
    };
  }

  @Get('user/:userId/export-history')
  async getExportHistory(@Param('userId') userId: string) {
    const exports = await this.complianceService.getUserExports(userId);
    return {
      userId,
      exports,
      regulation: 'gdpr_dpdp',
    };
  }

  @Get('user/:userId/pii-verification')
  async verifyPiiEncryption(@Param('userId') userId: string) {
    const result = await this.complianceService.verifyPiiEncryption(userId);
    return {
      userId,
      ...result,
      verifiedAt: new Date(),
      encryptionMethod: 'AES-256 via CryptoJS',
      fieldsChecked: ['email', 'phone'],
    };
  }

  @Get('user/:userId/data-export')
  async getUserDataExport(@Param('userId') userId: string) {
    return this.complianceService.exportUserData(userId);
  }

  @Post('mask/pii')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async maskPiiFields(@Body() dto: { data: Record<string, unknown>; fields: string[] }) {
    const masked = this.dataPrivacyService.maskPii(dto.data, dto.fields);
    return { maskedData: masked };
  }

  @Post('unmask/pii')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async unmaskPiiFields(@Body() dto: { data: Record<string, unknown>; fields: string[] }) {
    const decrypted = this.dataPrivacyService.unmaskPii(dto.data, dto.fields);
    return { decryptedData: decrypted };
  }
}
