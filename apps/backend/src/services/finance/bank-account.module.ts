import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
import { BankAccountEntity } from '../../db/entities/bank-account.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { TenantEntity } from '../../db/entities/tenant.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [BankAccountService],
  controllers: [BankAccountController],
  exports: [BankAccountService],
})
export class BankAccountModule {}
