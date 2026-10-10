import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressEntity } from '../../db/entities/address.entity';

@Module({
  imports: [DbRepositoriesModule],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class UserModule {}
