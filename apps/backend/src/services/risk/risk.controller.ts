import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RiskZoneService } from '../risk/risk-zone.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@ApiTags('risk')
@ApiBearerAuth()
@Controller('risk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskController {
  constructor(private readonly riskZoneService: RiskZoneService) {}

  @Post('check-address')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check risk for delivery address' })
  async checkAddressRisk(@Body() body: { addressId: string; lat: number; lng: number }) {
    return this.riskZoneService.checkAddressRisk(body.addressId, body.lat, body.lng);
  }

  @Post('check-driver')
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check driver location risk' })
  async checkDriverRisk(@Body() body: { driverId: string; lat: number; lng: number }) {
    return this.riskZoneService.checkDriverInRiskZone(body.driverId, body.lat, body.lng);
  }
}
