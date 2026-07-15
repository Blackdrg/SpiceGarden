import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { JournalEntryEntity } from '../../db/entities/journal-entry.entity';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { LedgerModule } from '../../modules/ledger/ledger.module';

@Module({
  imports: [DbRepositoriesModule, LedgerModule],
  providers: [AccountingService],
  controllers: [AccountingController],
  exports: [AccountingService],
})
export class AccountingModule {}
