import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
import { FinanceController } from './finance.controller';

import { LedgerModule } from '../../modules/ledger/ledger.module';

@Module({
  imports: [
    DbRepositoriesModule,
    LedgerModule,
  ],
  providers: [
    TaxReportingService,
    ReconciliationService,
  ],
  controllers: [
    FinanceController,
  ],
  exports: [
    TaxReportingService,
    ReconciliationService,
  ],
})
export class FinanceModule {}