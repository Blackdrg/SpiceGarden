import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('liveness')
  liveness() {
    // Ultra-lightweight: asserts event-loop and HTTP listener responsiveness without hitting external dependencies
    return { status: 'live', uptime: process.uptime(), timestamp: Date.now() };
  }

  @Get('readiness')
  readiness() {
    // Readiness indicates pod can receive traffic
    return { status: 'ready', timestamp: Date.now() };
  }

  @Get('startup')
  startup() {
    // Startup indicates bootstrap initialization completed
    return { status: 'started', timestamp: Date.now() };
  }
}
