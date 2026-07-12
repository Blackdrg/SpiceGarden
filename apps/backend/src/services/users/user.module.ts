import { Module } from '@nestjs/common';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';

@Module({
  imports: [DbRepositoriesModule],
  controllers: [AddressController, PaymentMethodsController],
  providers: [AddressService, PaymentMethodsService],
  exports: [AddressService, PaymentMethodsService],
})
export class UserModule {}
