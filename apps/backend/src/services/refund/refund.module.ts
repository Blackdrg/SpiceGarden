
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { RefundEntity } from '../../db/entities/refund.entity';
import { RefundApprovalEntity } from '../../db/entities/refund-approval.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { PaymentServiceModule } from '../../services/payments/payments.module';
import { NotificationModule } from '../../services/notifications/notification.module';
import { LedgerModule } from '../../modules/ledger/ledger.module';

@Module({
    imports: [
        DbRepositoriesModule,
        PaymentServiceModule,
        NotificationModule,
        LedgerModule
    ],
    providers: [RefundService],
    controllers: [RefundController],
    exports: [RefundService]
})
export class RefundModule {}

