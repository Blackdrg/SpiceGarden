import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { UpdatePreferencesDto } from './notification-preferences.dto';

@Controller('notification-preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(private readonly prefsService: NotificationPreferencesService) {}

  @Get()
  async getPreferences(@Req() req: any) {
    const userId = req.user?.sub;
    return this.prefsService.getPreferences(userId);
  }

  @Put()
  async updatePreferences(@Req() req: any, @Body() updates: UpdatePreferencesDto) {
    const userId = req.user?.sub;
    return this.prefsService.updatePreferences(userId, updates);
  }
}