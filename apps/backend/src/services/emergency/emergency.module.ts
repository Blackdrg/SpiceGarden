import {
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyIncidentEntity } from '../../db/entities/emergency-incident.entity';
import { EmergencyContactEntity } from '../../db/entities/emergency-contact.entity';
import { EmergencyIncidentTimelineEntity } from '../../db/entities/emergency-incident-timeline.entity';
import { RiskZoneEntity } from '../../db/entities/risk-zone.entity';
import { RiskEventEntity } from '../../db/entities/risk-event.entity';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { EmergencyGateway } from './emergency.gateway';
import { AuditModule } from '../../audit/audit.module';
import { NotificationModule } from '../notifications/notification.module';
import { RiskZoneModule } from '../risk/risk-zone.module';
import { TrackingModule } from '../../infra/tracking/tracking.module';

import { MockDispatchProvider } from './mock-dispatch.provider';
import { WebhookDispatchProvider } from './webhook-dispatch.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmergencyIncidentEntity,
      EmergencyContactEntity,
      EmergencyIncidentTimelineEntity,
      RiskZoneEntity,
      RiskEventEntity,
    ]),
    AuditModule,
    NotificationModule,
    RiskZoneModule,
    TrackingModule,
  ],
  controllers: [EmergencyController],
  providers: [EmergencyService, EmergencyGateway, MockDispatchProvider, WebhookDispatchProvider],
  exports: [EmergencyService, EmergencyGateway, MockDispatchProvider, WebhookDispatchProvider],
})
export class EmergencyModule {}
