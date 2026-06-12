import { Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from '../../security/encryption.service';
import { Repository, DataSource, LessThan } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DataExportRequestEntity } from '../../db/entities/data-export-request.entity';
import { DeletionRequestEntity } from '../../db/entities/deletion-request.entity';

export interface UserDataExport {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  };
  orders: any[];
  sessions: any[];
  auditLogs: any[];
  exportedAt: Date;
  regulation: string;
}

export interface DeletionVerificationInput {
  fullName: string;
  email: string;
  phone: string;
}

@Injectable()
export class DataPrivacyService {
  private readonly logger = new Logger(DataPrivacyService.name);

  constructor(
    private encryptionService: EncryptionService,
    private dataSource: DataSource,
  ) {}

  async getUserData(userId: string): Promise<any> {
    const user = this.dataSource.getRepository(UserEntity).findOne({ where: { id: userId } });
    const orders = this.dataSource.getRepository(OrderEntity).find({ where: { userId }, order: { createdAt: 'DESC' }, take: 1000 });
    const sessions = this.dataSource.getRepository(OrderEntity).find({ where: { userId } });
    const auditLogs = this.dataSource.getRepository(OrderEntity).find({ where: { userId }, order: { createdAt: 'DESC' }, take: 1000 });

    const [u, o, s, a] = await Promise.all([user, orders, sessions, auditLogs]);

    return {
      user: {
        id: u?.id,
        fullName: u?.fullName,
        email: u?.email,
        phone: u?.phone,
        createdAt: u?.createdAt,
        updatedAt: u?.updatedAt,
        deletedAt: u?.deletedAt,
      },
      orders: (o ?? []).map((ord: any) => ({
        id: ord.id,
        status: ord.status,
        paymentStatus: ord.paymentStatus,
        grandTotal: ord.grandTotal,
        createdAt: ord.createdAt,
        restaurantId: ord.restaurantId,
        branchId: ord.branchId,
        items: (ord.items ?? []).map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })),
      sessions: (s ?? []).map((sess: any) => ({
        id: sess.id,
        createdAt: sess.createdAt,
        expiresAt: sess.expiresAt,
      })),
      auditLogs: (a ?? []).map((log: any) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        createdAt: log.timestamp,
        metadata: log.metadata,
      })),
    };
  }

  maskPii<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
    const masked = { ...obj as Record<string, any> };
    for (const field of fields) {
      const key = String(field);
      if (key in masked && typeof masked[key] === 'string' && masked[key]) {
        masked[key] = this.encryptionService.encrypt(masked[key] as string);
      }
    }
    return masked as T;
  }

  unmaskPii<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
    const decrypted = { ...obj as Record<string, any> };
    for (const field of fields) {
      const key = String(field);
      if (key in decrypted && typeof decrypted[key] === 'string' && decrypted[key]) {
        try {
          decrypted[key] = this.encryptionService.decrypt(decrypted[key] as string) as T[keyof T];
        } catch (error) {
          this.logger.warn(`Failed to decrypt field ${key}: ${(error as Error).message}`);
        }
      }
    }
    return decrypted as T;
  }

  async processProtectedDeletion(userId: string): Promise<void> {
    const result = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const orderRepo = manager.getRepository(OrderEntity);
      const exportRepo = manager.getRepository(DataExportRequestEntity);
      const deletionRepo = manager.getRepository(DeletionRequestEntity);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const exportRequests = await exportRepo.find({ where: { userId, status: 'completed' } });
      const deletionRequest = await deletionRepo.findOne({ where: { userId, status: 'pending' } });

      if (!deletionRequest) throw new Error('Active deletion request not found');

      if (exportRequests.length === 0) {
        const exportData = await this.getUserData(userId) as any;
        await this.maskPii(exportData, ['user.email', 'user.phone', 'user.fullName']);
      }

      await deletionRepo.update(deletionRequest.id, { status: 'processing' });

      await Promise.all([
        orderRepo.update({ userId }, { status: 'cancelled' as any }),
        userRepo.update(userId, { status: 'deleted' as any }),
      ]);

      await deletionRepo.update(deletionRequest.id, { status: 'completed', completedAt: new Date() });
    });

    this.logger.log(`Completed protected deletion for user ${userId}`);
    return result;
  }
}
