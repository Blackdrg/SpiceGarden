import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { AddressEntity } from '../../db/entities/address.entity';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [UserProfileService],
  controllers: [UserProfileController],
  exports: [UserProfileService],
})
export class UserProfileModule {}