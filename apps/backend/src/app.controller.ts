import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth() {
    return this.appService.getHealth();
  }

  @Version(VERSION_NEUTRAL)
  @Get('health')
  async healthCheck() {
    return this.appService.getHealth();
  }
}
