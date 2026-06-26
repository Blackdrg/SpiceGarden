import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AddressService } from './address.service';
import { AddressEntity } from '../../db/entities/address.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [AddressService],
  exports: [AddressService],
})
export class UserModule {}
