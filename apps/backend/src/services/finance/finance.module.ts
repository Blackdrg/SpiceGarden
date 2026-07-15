import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
import { PlatformFeeService } from './platform-fee.service';
import { AccountingService } from './accounting.service';
import { BankAccountService } from './bank-account.service';
import { SettlementService } from './settlement.service';
import { FinanceController } from './finance.controller';
import { PlatformFeeController } from './platform-fee.controller';
import { AccountingController } from './accounting.controller';
import { BankAccountController } from './bank-account.controller';
import { SettlementController } from './settlement.controller';
import { PlatformFeeEntity } from '../../db/entities/platform-fee.entity';
import { JournalEntryEntity } from '../../db/entities/journal-entry.entity';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { BankAccountEntity } from '../../db/entities/bank-account.entity';
import { SettlementReportEntity } from '../../db/entities/settlement-report.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantGSTEntity } from '../../db/entities/restaurant-gst.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { LedgerModule } from '../../modules/ledger/ledger.module';

@Module({
  imports: [
    DbRepositoriesModule,
    LedgerModule,
  ],
  providers: [
    TaxReportingService,
    ReconciliationService,
    PlatformFeeService,
    AccountingService,
    BankAccountService,
    SettlementService,
  ],
  controllers: [
    FinanceController,
    PlatformFeeController,
    AccountingController,
    BankAccountController,
    SettlementController,
  ],
  exports: [
    TaxReportingService,
    ReconciliationService,
    PlatformFeeService,
    AccountingService,
    BankAccountService,
    SettlementService,
  ],
})
export class FinanceModule {}