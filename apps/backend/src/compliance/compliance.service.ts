import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { UserEntity } from '../db/entities/user.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { OrderEntity } from '../db/entities/order.entity';
import { DeletionRequestEntity } from '../db/entities/deletion-request.entity';
import { DataExportRequestEntity } from '../db/entities/data-export-request.entity';
import { EncryptionService } from '../security/encryption.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(DeletionRequestEntity)
    private readonly deletionRequestRepo: Repository<DeletionRequestEntity>,
    @InjectRepository(DataExportRequestEntity)
    private readonly dataExportRequestRepo: Repository<DataExportRequestEntity>,
  ) {}

  /**
   * GDPR-compliant data retention policy
   * - User data: retained for 7 years after account deletion (legal requirement)
   * - Order data: retained for 10 years (tax/legal requirements)
   * - Session data: retained for 90 days after expiration
   * - Audit logs: retained for 3 years (security/compliance)
   */
  async applyDataRetentionPolicies(): Promise<{ deletedSessions: number; oldAuditLogs: number }> {
    try {
      this.logger.log('Starting GDPR data retention policy application');
      
      const now = new Date();
      
      const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const deletedSessions = await this.sessionRepo.delete({
        expiresAt: LessThan(sessionCutoff),
      });
      this.logger.log(`Deleted ${deletedSessions.affected || 0} expired sessions`);
      
      const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
      const oldAuditCount = await this.auditLogRepo.count({
        where: { timestamp: LessThan(auditCutoff) },
      });
      this.logger.log(`Found ${oldAuditCount} audit logs for archival`);
      
      this.logger.log('GDPR data retention policy application completed');
      return { deletedSessions: deletedSessions.affected || 0, oldAuditLogs: oldAuditCount };
    } catch (error) {
      this.logger.error('Error applying data retention policies', error);
      throw error;
    }
  }

  async processPendingDeletionRequests(): Promise<{ processed: number; failed: number }> {
    try {
      this.logger.log('Processing pending deletion requests');
      const now = new Date();
      const pendingRequests = await this.deletionRequestRepo.find({
        where: {
          status: 'pending',
          scheduledDeletionDate: LessThan(now),
        },
      });

      const results = await Promise.all(
        pendingRequests.map(async (request) => {
          try {
            await Promise.all([
              this.userRepo.softDelete(request.userId),
              this.sessionRepo.update({ userId: request.userId }, { isActive: false }),
              this.deletionRequestRepo.update(request.id, {
                status: 'completed',
                completedAt: now,
              }),
            ]);
            this.logger.log(`Completed deletion request ${request.id} for user ${request.userId} (${request.regulation})`);
            return true;
          } catch (error) {
            this.logger.error(`Failed to process deletion request ${request.id}`, error);
            await this.deletionRequestRepo.update(request.id, {
              status: 'failed',
            });
            return false;
          }
        }),
      );

      let processed = 0;
      let failed = 0;
      for (const success of results) {
        if (success) processed++;
        else failed++;
      }

      this.logger.log(`Deletion request processing complete: processed=${processed}, failed=${failed}`);
      return { processed, failed };
    } catch (error) {
      this.logger.error('Error processing pending deletion requests', error);
      return { processed: 0, failed: 0 };
    }
  }

  @Cron('0 0 2 * * *', {
    name: 'compliance-scan',
    timeZone: 'Asia/Kolkata',
  })
  async handleComplianceScan() {
    this.logger.log('Starting scheduled compliance scan');
    try {
      const retention = await this.applyDataRetentionPolicies();
      const processed = await this.processPendingDeletionRequests();
      this.logger.log(`Compliance scan complete: retention=${JSON.stringify(retention)}, deletions=${JSON.stringify(processed)}`);
    } catch (error) {
      this.logger.error('Scheduled compliance scan failed', error);
    }
  }

  /**
   * Check if user data should be retained based on GDPR
   * @param userId The user ID to check
   * @returns boolean indicating if data should be retained
   */
  async shouldRetainUserData(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { deletedAt: true },
    });

    if (!user || !user.deletedAt) {
      return true; // Active user, retain data
    }

    // Retain for 7 years after deletion (legal requirement)
    const retentionPeriodMs = 7 * 365 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(user.deletedAt.getTime() + retentionPeriodMs);
    
    return new Date() < cutoffDate;
  }

  /**
   * Delete user data (GDPR right to be forgotten)
   * @param userId The user ID to delete
   */
  async deleteUserData(userId: string): Promise<void> {
    await this.userRepo.softDelete(userId);
    await this.sessionRepo.update({ userId }, { isActive: false });
    this.logger.log(`Deleted user data for user ${userId}`);
  }

  /**
   * Export user data (GDPR right to access)
   * @param userId The user ID to export
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [orders, sessions, auditLogs] = await Promise.all([
      this.orderRepo.find({
        where: { userId },
      }),
      this.sessionRepo.find({
        where: { userId },
      }),
      this.auditLogRepo.find({
        where: { performedBy: userId },
        take: 1000,
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      orders,
      sessions: sessions.map(s => ({
        deviceName: s.deviceName,
        deviceType: s.deviceType,
        createdAt: s.createdAt,
      })),
      auditLogs: auditLogs.map(l => ({
        action: l.action,
        timestamp: l.timestamp,
      })),
      exportedAt: new Date(),
      regulation: 'gdpr',
    };
  }

  /**
   * Get data retention statistics
   */
async getRetentionStatistics(): Promise<any> {
    const now = new Date();
    const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalSessions, expiredSessions, oldAuditLogs, pendingDeletionRequests] = await Promise.all([
      this.userRepo.count(),
      this.sessionRepo.count(),
      this.sessionRepo.count({ where: { expiresAt: LessThan(sessionCutoff) } }),
      this.auditLogRepo.count({ where: { timestamp: LessThan(auditCutoff) } }),
      this.deletionRequestRepo.count({ where: { status: 'pending' } }),
    ]);

    return {
      retentionPolicies: {
        sessionRetentionDays: 90,
        auditLogRetentionYears: 3,
        userDataRetentionYears: 7,
        orderRetentionYears: 10,
      },
      statistics: {
        totalUsers,
        totalSessions,
        expiredSessions,
        oldAuditLogs,
        pendingDeletionRequests,
      },
    };
  }

   async requestUserDataDeletion(userId: string, regulation: string, reason?: string): Promise<any> {
     const existingRequest = await this.deletionRequestRepo.findOne({
       where: { userId, status: 'pending' },
     });

      if (existingRequest) {
        throw new ConflictException('User already has a pending deletion request');
      }

     const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
     const request = this.deletionRequestRepo.create({
       userId,
       regulation,
       reason,
       scheduledDeletionDate: scheduledDate,
       status: 'pending',
     });

     const saved = await this.deletionRequestRepo.save(request);
     this.logger.log(`Created ${regulation} deletion request for user ${userId}`);

     return {
       requestId: saved.id,
       regulation: saved.regulation,
       status: saved.status,
       message: 'Deletion request submitted successfully',
     };
   }

   async cancelUserDataDeletion(userId: string): Promise<{ success: boolean; message: string }> {
     const request = await this.deletionRequestRepo.findOne({
       where: { userId, status: 'pending' },
     });

     if (!request) {
       return {
         success: false,
         message: 'No pending deletion request found',
       };
     }

     await this.deletionRequestRepo.update(request.id, {
       status: 'cancelled',
       cancellationReason: 'User requested cancellation',
     });

     this.logger.log(`Cancelled deletion request for user ${userId}`);
     return {
       success: true,
       message: 'Deletion request cancelled',
     };
   }

   async getUserDataDeletionStatus(userId: string): Promise<null | { status: string; scheduledDeletionDate: Date; regulation: string }> {
     const request = await this.deletionRequestRepo.findOne({
       where: { userId },
       order: { createdAt: 'DESC' },
     });

     if (!request) {
       return null;
     }

     return {
       status: request.status,
       scheduledDeletionDate: request.scheduledDeletionDate,
       regulation: request.regulation,
     };
   }

   async getUserExports(userId: string): Promise<any[]> {
     const exports = await this.dataExportRequestRepo.find({
       where: { userId },
       order: { createdAt: 'DESC' },
       take: 50,
     });

     return exports.map(e => ({
       id: e.id,
       status: e.status,
       createdAt: e.createdAt,
       completedAt: e.completedAt,
       exportFormat: e.exportFormat,
       regulation: e.regulation,
     }));
   }

   async verifyPiiEncryption(userId: string): Promise<any> {
      const piiFields = ['email', 'phone', 'fullName'];
      const user = await this.userRepo.findOne({ where: { id: userId } });
       if (!user) {
         throw new NotFoundException('User not found');
       }

      const fieldsStatus: Record<string, 'encrypted' | 'plaintext_warning' | 'missing'> = {};
      const encryptedFields: string[] = [];
      for (const field of piiFields) {
        const value = user[field as keyof UserEntity] as any;
        if (typeof value === 'string' && /^[A-Za-z0-9+/=]{40,}\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/.test(value)) {
          fieldsStatus[field] = 'encrypted';
          encryptedFields.push(field);
        } else if (typeof value === 'string' && value.length > 0) {
          fieldsStatus[field] = 'plaintext_warning';
        } else {
          fieldsStatus[field] = 'missing';
        }
      }

        return {
          encryptedFields,
          fieldsStatus,
          isEncrypted: encryptedFields.length === piiFields.length,
          verified: encryptedFields.length === piiFields.length,
        };
     }

     async verifyBackupIntegrity(): Promise<{ valid: boolean; recentBackups: number; latestBackup?: string; errors: string[] }> {
       const backupDir = process.env.BACKUP_DIR || '/backup';
       const errors: string[] = [];

       try {
         if (!fs.existsSync(backupDir)) {
           errors.push('Backup directory does not exist');
           return { valid: false, recentBackups: 0, errors };
         }

         const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.tar.gz') || f.endsWith('.tar.gz.enc'));
         const recentBackups = files.filter(f => {
           const filePath = path.join(backupDir, f);
           const stat = fs.statSync(filePath);
           const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
           return ageDays <= 7;
         });

         if (recentBackups.length === 0) {
           errors.push('No backups found within the last 7 days');
         }

         let latestBackup: string | undefined;
         if (files.length > 0) {
           files.sort((a, b) => {
             const statA = fs.statSync(path.join(backupDir, a));
             const statB = fs.statSync(path.join(backupDir, b));
             return statB.mtimeMs - statA.mtimeMs;
           });
           latestBackup = files[0];

           const latestPath = path.join(backupDir, latestBackup);
           const latestStat = fs.statSync(latestPath);
           if (latestStat.size === 0) {
             errors.push(`Latest backup ${latestBackup} is empty`);
           }
         }

         return {
           valid: errors.length === 0,
           recentBackups: recentBackups.length,
           latestBackup,
           errors,
         };
       } catch (error) {
         this.logger.error('Backup integrity verification failed', error);
         return {
           valid: false,
           recentBackups: 0,
           errors: [`Verification error: ${error instanceof Error ? error.message : 'unknown'}`],
         };
       }
     }
   }