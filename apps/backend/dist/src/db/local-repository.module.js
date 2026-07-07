"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalRepositoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const DATA_SOURCE_TOKEN = 'DataSource';
function createRepository(entity) {
    const rows = [];
    return {
        target: entity,
        metadata: { tableName: entity?.name || 'unknown' },
        manager: {
            transaction: async (_, work) => (work || _)(undefined),
        },
        createQueryBuilder: () => ({
            select: function () { return this; },
            from: function () { return this; },
            where: function () { return this; },
            andWhere: function () { return this; },
            orWhere: function () { return this; },
            orderBy: function () { return this; },
            addOrderBy: function () { return this; },
            limit: function () { return this; },
            offset: function () { return this; },
            leftJoinAndSelect: function () { return this; },
            innerJoinAndSelect: function () { return this; },
            setParameters: function () { return this; },
            getMany: async () => rows,
            getOne: async () => rows[0] || null,
            getManyAndCount: async () => [rows, rows.length],
            getCount: async () => rows.length,
            delete: async () => ({ affected: rows.length }),
            update: async () => ({ affected: rows.length }),
        }),
        find: async () => rows,
        findBy: async () => rows,
        findOne: async (options) => {
            if (!options || !options.where) {
                return rows[0] || null;
            }
            const criteria = options.where;
            return rows.find((row) => Object.entries(criteria).every(([key, value]) => row[key] === value)) || null;
        },
        findOneBy: async (criteria) => {
            if (!criteria) {
                return rows[0] || null;
            }
            return rows.find((row) => Object.entries(criteria).every(([key, value]) => row[key] === value)) || null;
        },
        findAndCount: async () => [rows, rows.length],
        count: async () => rows.length,
        create: (data = {}) => ({ ...(data || {}) }),
        merge: (target, data = {}) => Object.assign(target || {}, data),
        save: async (data) => {
            if (Array.isArray(data)) {
                const saved = data.map((item, index) => ({ id: item.id || `${entity.name.toLowerCase()}-${index + 1}`, ...item }));
                rows.push(...saved);
                return saved;
            }
            const saved = { id: data.id || `${entity.name.toLowerCase()}-${rows.length + 1}`, ...data };
            rows.push(saved);
            return saved;
        },
        update: async (_, data) => {
            Object.assign(rows[0] || {}, data);
            return { affected: rows.length };
        },
        delete: async () => {
            rows.length = 0;
            return { affected: 0 };
        },
        remove: async (data) => {
            if (Array.isArray(data)) {
                const ids = new Set(data.map((item) => item?.id));
                const filtered = rows.filter((item) => !ids.has(item.id));
                rows.length = 0;
                rows.push(...filtered);
                return data;
            }
            const index = rows.findIndex((item) => item.id === data?.id);
            if (index >= 0)
                rows.splice(index, 1);
            return data;
        },
        query: async () => [],
        clear: async () => {
            rows.length = 0;
        },
    };
}
const repositoryDefinitions = [
    require('../db/entities/audit-log.entity').AuditLogEntity,
    require('../db/entities/user.entity').UserEntity,
    require('../db/entities/session.entity').SessionEntity,
    require('../db/entities/deletion-request.entity').DeletionRequestEntity,
    require('../db/entities/data-export-request.entity').DataExportRequestEntity,
    require('../services/payments/payment-fraud.entity').PaymentFraudFlagEntity,
    require('../db/entities/driver.entity').DriverEntity,
    require('../db/entities/driver-assignment.entity').DriverAssignmentEntity,
    require('../db/entities/order.entity').OrderEntity,
    require('../db/entities/notification.entity').NotificationEntity,
    require('../db/entities/order-item.entity').OrderItemEntity,
    require('../db/entities/menu-item.entity').MenuItemEntity,
    require('../db/entities/restaurant-branch.entity').RestaurantBranchEntity,
    require('../db/entities/address.entity').AddressEntity,
    require('../db/entities/driver-score.entity').DriverScoreEntity,
    require('../db/entities/delivery-sla.entity').DeliverySLAEntity,
    require('../db/entities/driver-fraud.entity').DriverFraudEntity,
    require('../db/entities/inventory-item.entity').InventoryItemEntity,
    require('../db/entities/recipe.entity').RecipeEntity,
    require('../db/entities/batch.entity').BatchEntity,
    require('../db/entities/food-prep.entity').FoodPrepEntity,
    require('../db/entities/kitchen-sla.entity').KitchenSLAEntity,
    require('../db/entities/supplier.entity').SupplierEntity,
    require('../db/entities/inventory-alert.entity').InventoryAlertEntity,
    require('../db/entities/sla-alert.entity').SLAAlertEntity,
    require('../db/entities/menu-item-availability.entity').MenuItemAvailabilityEntity,
    require('../db/entities/ledger-entry.entity').LedgerEntryEntity,
    require('../db/entities/wallet.entity').WalletEntity,
    require('../db/entities/wallet-transaction.entity').WalletTransactionEntity,
    require('../db/entities/driver-document.entity').DriverDocumentEntity,
    require('../db/entities/driver-incentive.entity').DriverIncentiveEntity,
    require('../db/entities/surge-zone.entity').SurgeZoneEntity,
    require('../db/entities/driver-shift.entity').DriverShiftEntity,
    require('../db/entities/driver-penalty.entity').DriverPenaltyEntity,
    require('../db/entities/payout-report.entity').PayoutReportEntity,
    require('../db/entities/gst-detail.entity').GSTDetailEntity,
    require('../db/entities/restaurant.entity').RestaurantEntity,
    require('../db/entities/restaurant-gst.entity').RestaurantGSTEntity,
    require('../db/entities/hsn-sac.entity').HSNSACEntity,
    require('../db/entities/coupon.entity').CouponEntity,
    require('../db/entities/coupon-usage.entity').CouponUsageEntity,
    require('../db/entities/referral.entity').ReferralEntity,
    require('../db/entities/subscription.entity').SubscriptionEntity,
    require('../db/entities/menu-category.entity').MenuCategoryEntity,
    require('../db/entities/menu-addon.entity').MenuAddonEntity,
    require('../db/entities/notification-preference.entity').NotificationPreferenceEntity,
    require('../db/entities/user-device.entity').UserDeviceEntity,
    require('../services/payments/idempotency.entity').IdempotencyEntity,
    require('../services/payments/payment-validation.entity').PaymentValidationEventEntity,
    require('../db/entities/payment-dispute.entity').PaymentDisputeEntity,
    require('../db/entities/webhook-retry-queue.entity').WebhookRetryQueueEntity,
    require('../db/entities/payment-webhook.entity').PaymentWebhookEntity,
    require('../services/payments/payment-event.entity').PaymentEventEntity,
    require('../db/entities/refund.entity').RefundEntity,
    require('../db/entities/refund-approval.entity').RefundApprovalEntity,
    require('../db/entities/commission-rule.entity').CommissionRuleEntity,
    require('../db/entities/menu-moderation.entity').MenuModerationEntity,
    require('../db/entities/restaurant-onboarding.entity').RestaurantOnboardingEntity,
    require('../db/entities/dispute.entity').DisputeEntity,
    require('../db/entities/support-ticket.entity').SupportTicketEntity,
    require('../db/entities/payment-method.entity').PaymentMethodEntity,
];
let LocalRepositoryModule = class LocalRepositoryModule {
};
exports.LocalRepositoryModule = LocalRepositoryModule;
exports.LocalRepositoryModule = LocalRepositoryModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: DATA_SOURCE_TOKEN,
                useValue: {
                    isInitialized: true,
                    initialize: async () => undefined,
                    destroy: async () => undefined,
                    getRepository: (entity) => createRepository(entity),
                    createQuery: () => ({ getRawMany: async () => [], getRawOne: async () => null }),
                    transaction: async (_, work) => (work || _)(undefined),
                },
            },
            {
                provide: typeorm_2.DataSource,
                useExisting: DATA_SOURCE_TOKEN,
            },
            ...repositoryDefinitions.flatMap((entity) => [
                {
                    provide: (0, typeorm_1.getRepositoryToken)(entity),
                    useValue: createRepository(entity),
                },
            ]),
        ],
        exports: [typeorm_2.DataSource, DATA_SOURCE_TOKEN, ...repositoryDefinitions.map((entity) => (0, typeorm_1.getRepositoryToken)(entity))],
    })
], LocalRepositoryModule);
