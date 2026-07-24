import { Module } from '@nestjs/common';
import { RiskZoneService } from './risk-zone.service';
import { RiskZoneController } from './risk-zone.controller';
import { RiskController } from './risk.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskZoneEntity } from '../../db/entities/risk-zone.entity';
import { RiskEventEntity } from '../../db/entities/risk-event.entity';
import { RiskNotificationEntity } from '../../db/entities/risk-notification.entity';
import { AuditModule } from '../../audit/audit.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiskZoneEntity, RiskEventEntity, RiskNotificationEntity]),
    AuditModule,
    NotificationModule,
  ],
  controllers: [RiskZoneController, RiskController],
  providers: [RiskZoneService],
  exports: [RiskZoneService],
})
export class RiskZoneModule {}
