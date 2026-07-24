import { Controller, Post, Body, UseGuards, Get, Param, Put, Query, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { CreateSosDto, EmergencyLocationDto, UpdateIncidentStatusDto, CreateEmergencyContactDto, EmergencyIncidentFilterDto } from './emergency.dto';

@ApiTags('emergency')
@ApiBearerAuth()
@Controller('emergency')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('sos')
  @Roles(UserRole.DRIVER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
  @ApiOperation({ summary: 'Trigger emergency SOS' })
  async triggerSos(@Body() dto: CreateSosDto, @Req() req: any) {
    const performedBy = req.user?.sub || req.user?.id || dto.driverId;
    const incident = await this.emergencyService.createSos(dto, req, performedBy);
    return { success: true, data: incident };
  }

  @Post('location')
  @Roles(UserRole.DRIVER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
  @ApiOperation({ summary: 'Update emergency incident location' })
  async updateLocation(@Body() dto: EmergencyLocationDto, @Req() req: any) {
    const performedBy = req.user?.sub || req.user?.id;
    const incident = await this.emergencyService.updateLocation(dto, req, performedBy);
    return { success: true, data: incident };
  }

  @Get('incidents/:id')
  @Roles(UserRole.DRIVER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
  @ApiOperation({ summary: 'Get emergency incident details' })
  async getIncident(@Param('id') id: string) {
    return this.emergencyService.getIncident(id);
  }

  @Get('incidents/:id/timeline')
  @Roles(UserRole.DRIVER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
  @ApiOperation({ summary: 'Get emergency incident timeline' })
  async getIncidentTimeline(@Param('id') id: string) {
    return this.emergencyService.getIncidentTimeline(id);
  }

  @Get('incidents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
  @ApiOperation({ summary: 'List emergency incidents (admin)' })
  async getIncidents(@Query() filters: EmergencyIncidentFilterDto) {
    return this.emergencyService.getIncidents(filters);
  }

  @Put('incidents/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
  @ApiOperation({ summary: 'Update emergency incident status' })
  async updateIncidentStatus(@Param('id') id: string, @Body() dto: UpdateIncidentStatusDto, @Req() req: any) {
    const performedBy = req.user?.sub || req.user?.id;
    const incident = await this.emergencyService.updateIncidentStatus(id, dto, req, performedBy);
    return { success: true, data: incident };
  }

  @Post('contacts')
  @Roles(UserRole.DRIVER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create emergency contact' })
  async createContact(@Body() dto: CreateEmergencyContactDto) {
    return this.emergencyService.createEmergencyContact(dto);
  }

  @Get('contacts')
  @Roles(UserRole.DRIVER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get driver emergency contacts' })
  async getContacts(@Query('driverId') driverId: string) {
    if (!driverId) throw new BadRequestException('driverId is required');
    return this.emergencyService.getDriverContacts(driverId);
  }

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get emergency dashboard statistics' })
  async getDashboard() {
    return this.emergencyService.getDashboardStats();
  }
}
