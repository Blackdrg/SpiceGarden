import { Module } from '@nestjs/common';
import { PaymentQrService } from './payment-qr.service';
import { PaymentQrController } from './payment-qr.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentQrCodeEntity } from '../../../db/entities/payment-qr.entity';
import { AuditModule } from '../../../audit/audit.module';
import { PaymentServiceModule } from '../payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentQrCodeEntity]),
    AuditModule,
    PaymentServiceModule,
  ],
  controllers: [PaymentQrController],
  providers: [PaymentQrService],
  exports: [PaymentQrService],
})
export class PaymentQrModule {}
