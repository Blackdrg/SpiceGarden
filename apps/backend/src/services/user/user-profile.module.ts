import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { AddressEntity } from '../../db/entities/address.entity';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AddressEntity, PaymentMethodEntity])],
  providers: [UserProfileService],
  controllers: [UserProfileController],
  exports: [UserProfileService],
})
export class UserProfileModule {}