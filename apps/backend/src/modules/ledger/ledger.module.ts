import { Module } from '@nestjs/common';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { LedgerService } from './ledger.service';

@Module({
  imports: [DbRepositoriesModule],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}