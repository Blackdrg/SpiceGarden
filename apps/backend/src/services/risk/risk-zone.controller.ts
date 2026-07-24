import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RiskZoneService } from './risk-zone.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@ApiTags('risk-zones')
@ApiBearerAuth()
@Controller('risk-zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskZoneController {
  constructor(private readonly riskZoneService: RiskZoneService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a risk zone' })
  async createRiskZone(@Body() body: any) {
    return this.riskZoneService.createRiskZone(body);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER)
  @ApiOperation({ summary: 'Get all risk zones' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'severity', required: false, type: String })
  async getRiskZones(@Query() query: any) {
    return this.riskZoneService.getRiskZones({
      active: query.active !== undefined ? query.active === 'true' : undefined,
      minScore: query.minScore ? parseInt(query.minScore) : undefined,
      severity: query.severity,
    });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get risk zone statistics' })
  async getRiskStats() {
    return this.riskZoneService.getRiskStats();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER)
  @ApiOperation({ summary: 'Get a risk zone by ID' })
  async getRiskZone(@Param('id') id: string) {
    return this.riskZoneService.getRiskZone(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a risk zone' })
  async updateRiskZone(@Param('id') id: string, @Body() body: any) {
    return this.riskZoneService.updateRiskZone(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a risk zone' })
  async deleteRiskZone(@Param('id') id: string) {
    await this.riskZoneService.deleteRiskZone(id);
    return { message: 'Risk zone deleted successfully' };
  }

  @Post('check-coordinates')
  @ApiOperation({ summary: 'Check if coordinates are in a risk zone' })
  async checkCoordinates(@Body() body: { lat: number; lng: number }) {
    const zone = await this.riskZoneService.isPointInRiskZone(body.lat, body.lng);
    return {
      inRiskZone: !!zone,
      zone: zone || null,
      riskScore: zone?.riskScore || 0,
      severity: zone?.severity || null,
    };
  }

  @Post('check-address')
  @ApiOperation({ summary: 'Check risk level for delivery address' })
  async checkAddressRisk(@Body() body: { addressId: string; lat: number; lng: number }) {
    return this.riskZoneService.checkAddressRisk(body.addressId, body.lat, body.lng);
  }

  @Post('driver/check')
  @ApiOperation({ summary: 'Check driver location against risk zones' })
  async checkDriverRisk(@Body() body: { driverId: string; lat: number; lng: number }) {
    return this.riskZoneService.checkDriverInRiskZone(body.driverId, body.lat, body.lng);
  }

  @Get('events')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get risk events' })
  async getRiskEvents(@Query() query: any) {
    return this.riskZoneService.getRiskEvents({
      zoneId: query.zoneId,
      driverId: query.driverId,
      userId: query.userId,
    });
  }
}
