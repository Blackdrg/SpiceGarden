import { Module } from '@nestjs/common';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { LedgerService } from './ledger.service';

@Module({
  imports: [LocalRepositoryModule],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}