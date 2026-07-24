import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudBlacklistController } from './fraud-blacklist.controller';
import { FraudBlacklistService } from './fraud-blacklist.service';
import { FraudBlacklistEntity } from '../../db/entities/fraud-blacklist.entity';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FraudBlacklistEntity]),
    AuditModule,
  ],
  controllers: [FraudBlacklistController],
  providers: [FraudBlacklistService],
  exports: [FraudBlacklistService],
})
export class FraudBlacklistModule {}