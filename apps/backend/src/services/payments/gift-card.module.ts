import { Module } from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { GiftCardController } from './gift-card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCardEntity } from '../../db/entities/gift-card.entity';
import { WalletModule } from '../../services/wallet/wallet.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCardEntity]),
    WalletModule,
    AuditModule,
  ],
  controllers: [GiftCardController],
  providers: [GiftCardService],
  exports: [GiftCardService],
})
export class GiftCardModule {}