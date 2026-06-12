import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { AddressService } from './address.service';
import { AddressEntity } from '../../db/entities/address.entity';

@Module({
  imports: [LocalRepositoryModule],
  providers: [AddressService],
  exports: [AddressService],
})
export class UserModule {}
