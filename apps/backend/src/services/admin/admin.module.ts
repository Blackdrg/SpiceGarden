import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';

@Module({
  imports: [
    LocalRepositoryModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminServiceModule {}
