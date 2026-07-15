import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BankAccountEntity, BankAccountType, KycStatus, VerificationStatus } from '../../db/entities/bank-account.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { TenantEntity } from '../../db/entities/tenant.entity';

@Injectable()
export class BankAccountService {
  private readonly logger = new Logger(BankAccountService.name);

  constructor(
    @InjectRepository(BankAccountEntity)
    private bankRepo: Repository<BankAccountEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(TenantEntity)
    private tenantRepo: Repository<TenantEntity>,
    private dataSource: DataSource,
  ) {}

  async addBankAccount(bankData: Partial<BankAccountEntity>): Promise<BankAccountEntity> {
    if (bankData.entityType === 'restaurant') {
      const restaurant = await this.restaurantRepo.findOne({ where: { id: bankData.entityId } });
      if (!restaurant) throw new NotFoundException('Restaurant not found');
    } else if (bankData.entityType === 'driver') {
      const driver = await this.driverRepo.findOne({ where: { id: bankData.entityId } });
      if (!driver) throw new NotFoundException('Driver not found');
    }

    if (bankData.isPrimary) {
      await this.bankRepo.update(
        { entityType: bankData.entityType, entityId: bankData.entityId },
        { isPrimary: false }
      );
    }

    const bankAccount = this.bankRepo.create(bankData);
    return this.bankRepo.save(bankAccount);
  }

  async getBankAccounts(entityType: string, entityId: string): Promise<BankAccountEntity[]> {
    return this.bankRepo.find({
      where: { entityType: entityType as any, entityId, isActive: true },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async getBankAccount(id: string): Promise<BankAccountEntity> {
    const account = await this.bankRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }

  async updateBankAccount(id: string, updateData: Partial<BankAccountEntity>): Promise<BankAccountEntity> {
    if (updateData.isPrimary) {
      const account = await this.bankRepo.findOne({ where: { id } });
      if (account) {
        await this.bankRepo.update(
          { entityType: account.entityType, entityId: account.entityId },
          { isPrimary: false }
        );
      }
    }
    await this.bankRepo.update(id, updateData);
    return (await this.bankRepo.findOne({ where: { id } }))!;
  }

  async submitKyc(id: string, documents: any): Promise<BankAccountEntity> {
    const account = await this.bankRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Bank account not found');

    account.kycStatus = KycStatus.IN_PROGRESS;
    account.kycDocuments = documents;
    return this.bankRepo.save(account);
  }

  async verifyBankAccount(id: string, verifiedBy: string): Promise<BankAccountEntity> {
    const account = await this.bankRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Bank account not found');

    account.kycStatus = KycStatus.VERIFIED;
    account.verificationStatus = VerificationStatus.INSTANT;
    account.verifiedAt = new Date();
    return this.bankRepo.save(account);
  }

  async rejectKyc(id: string, reason: string): Promise<BankAccountEntity> {
    const account = await this.bankRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Bank account not found');

    account.kycStatus = KycStatus.REJECTED;
    account.metadata = { ...account.metadata, rejectionReason: reason };
    return this.bankRepo.save(account);
  }

  async getPendingKyc(): Promise<BankAccountEntity[]> {
    return this.bankRepo.find({
      where: { kycStatus: KycStatus.IN_PROGRESS },
      relations: { restaurant: true, driver: true },
      order: { createdAt: 'ASC' },
    });
  }
}
