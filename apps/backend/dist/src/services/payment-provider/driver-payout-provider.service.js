"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DriverPayoutProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPayoutProviderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
let DriverPayoutProviderService = DriverPayoutProviderService_1 = class DriverPayoutProviderService {
    constructor(configService, incentiveRepo, driverRepo, orderRepo) {
        this.configService = configService;
        this.incentiveRepo = incentiveRepo;
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.logger = new common_1.Logger(DriverPayoutProviderService_1.name);
        this.baseUrl = 'https://api.razorpay.com/v1';
        this.keyId = this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
        this.keySecret = this.configService.get('RAZORPAY_KEY_SECRET') || 'test_placeholder';
    }
    async rzpRequest(method, endpoint, data) {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            method,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: method !== 'GET' && method !== 'DELETE' ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData?.error?.description || `Razorpay API error: ${response.status}`;
            throw new Error(message);
        }
        if (method === 'DELETE') {
            return {};
        }
        return response.json();
    }
    async processDriverPayout(incentiveId, bankDetails) {
        const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
        if (!incentive) {
            throw new common_1.NotFoundException('Incentive record not found');
        }
        if (incentive.status !== driver_incentive_entity_1.IncentiveStatus.APPROVED) {
            throw new common_1.BadRequestException(`Incentive must be APPROVED before payout. Current status: ${incentive.status}`);
        }
        const driver = await this.driverRepo.findOne({ where: { id: incentive.driverId } });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        try {
            const fundAccount = await this.rzpRequest('POST', 'fund_accounts', {
                account_type: 'bank_account',
                bank_account: {
                    name: bankDetails.accountHolderName,
                    ifsc: bankDetails.ifscCode,
                    account_number: bankDetails.accountNumber,
                },
                contact: {
                    name: bankDetails.accountHolderName,
                    type: 'customer',
                    reference_type: 'driver',
                    reference_id: driver.id,
                },
                notes: {
                    driver_id: driver.id,
                    incentive_id: incentiveId,
                    type: 'driver_payout',
                },
            });
            const amountInPaise = Math.round(Number(incentive.amount) * 100);
            const settlement = await this.rzpRequest('POST', 'settlements', {
                amount: amountInPaise,
                currency: 'INR',
                mode: 'IMPS',
                fund_account_id: fundAccount.id,
                notify_sms: true,
                notes: {
                    driver_id: driver.id,
                    incentive_id: incentiveId,
                    type: 'driver_incentive_payout',
                },
            });
            await this.incentiveRepo.update(incentiveId, {
                status: driver_incentive_entity_1.IncentiveStatus.PAID,
                payoutReference: `rzp_settlement_${settlement.id}`,
                paidAt: new Date(),
            });
            this.logger.log(`Driver payout processed: ${settlement.id} for driver ${driver.id}, incentive ${incentiveId}`);
            return {
                payoutId: settlement.id,
                status: settlement.status || 'processing',
                amount: incentive.amount,
                processedAt: new Date(settlement.created_at * 1000).toISOString(),
                reference: `rzp_settlement_${settlement.id}`,
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Driver payout failed for incentive ${incentiveId}:`, err);
            throw new common_1.BadRequestException(`Driver payout failed: ${err.message}`);
        }
    }
    async getPendingPayouts(driverId) {
        const where = { status: driver_incentive_entity_1.IncentiveStatus.APPROVED };
        if (driverId) {
            where.driverId = driverId;
        }
        return this.incentiveRepo.find({
            where,
            relations: ['driver'],
            order: { createdAt: 'ASC' },
        });
    }
    async getPayoutHistory(driverId, limit = 10) {
        return this.incentiveRepo.find({
            where: { driverId, status: driver_incentive_entity_1.IncentiveStatus.PAID },
            order: { paidAt: 'DESC' },
            take: limit,
        });
    }
};
exports.DriverPayoutProviderService = DriverPayoutProviderService;
exports.DriverPayoutProviderService = DriverPayoutProviderService = DriverPayoutProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(driver_incentive_entity_1.DriverIncentiveEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DriverPayoutProviderService);
//# sourceMappingURL=driver-payout-provider.service.js.map