import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { TrackingGateway } from './tracking.gateway';
import { NotificationEntity } from '../../db/entities/notification.entity';

@Global()
@Module({
  imports: [LocalRepositoryModule],
  providers: [TrackingGateway],
  exports: [TrackingGateway],
})
export class TrackingModule {}