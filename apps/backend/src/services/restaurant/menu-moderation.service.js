"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModerationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const menu_moderation_entity_1 = require("../../db/entities/menu-moderation.entity");
let MenuModerationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MenuModerationService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MenuModerationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        moderationRepo;
        itemRepo;
        restaurantRepo;
        dataSource;
        logger = new common_1.Logger(MenuModerationService.name);
        constructor(moderationRepo, itemRepo, restaurantRepo, dataSource) {
            this.moderationRepo = moderationRepo;
            this.itemRepo = itemRepo;
            this.restaurantRepo = restaurantRepo;
            this.dataSource = dataSource;
        }
        async submitForModeration(menuItemId, restaurantId, action, data, originalData) {
            const menuItem = await this.itemRepo.findOne({ where: { id: menuItemId } });
            if (!menuItem) {
                throw new common_1.NotFoundException('Menu item not found');
            }
            const aiFlags = this.detectAIFlags(data);
            const moderation = this.moderationRepo.create({
                menuItemId,
                restaurantId,
                action,
                status: menu_moderation_entity_1.ModerationStatus.PENDING,
                updatedData: data,
                originalData: originalData || {},
                aiFlags,
                flaggedForReview: this.shouldFlagForReview(aiFlags),
            });
            const saved = await this.moderationRepo.save(moderation);
            await this.itemRepo.update(menuItemId, { status: 'pending_moderation' });
            return saved;
        }
        detectAIFlags(data) {
            const flags = {};
            if (data?.basePrice && (data.basePrice < 10 || data.basePrice > 5000)) {
                flags.priceAnomaly = true;
            }
            if (data?.description && data.description.length < 10) {
                flags.descriptionIssue = true;
            }
            if (!data?.imageUrl || data?.imageUrl?.includes('placeholder')) {
                flags.imageProblem = true;
            }
            return flags;
        }
        shouldFlagForReview(flags) {
            return Object.values(flags).some((v) => v === true);
        }
        async getPendingModerations(restaurantId, priorityOnly = false) {
            const where = { status: menu_moderation_entity_1.ModerationStatus.PENDING };
            if (restaurantId) {
                where.restaurantId = restaurantId;
            }
            return this.moderationRepo.find({
                where,
                relations: ['menuItem', 'restaurant'],
                order: { createdAt: 'DESC' },
            });
        }
        async reviewModeration(moderationId, moderatorId, status, notes) {
            const moderation = await this.moderationRepo.findOne({ where: { id: moderationId } });
            if (!moderation) {
                throw new common_1.NotFoundException('Moderation request not found');
            }
            await this.moderationRepo.update(moderationId, {
                status,
                moderatorId,
                moderatorNotes: notes,
                reviewedAt: new Date(),
            });
            if (status === menu_moderation_entity_1.ModerationStatus.APPROVED) {
                await this.itemRepo.update(moderation.menuItemId, { status: 'available' });
            }
            else if (status === menu_moderation_entity_1.ModerationStatus.REJECTED || status === menu_moderation_entity_1.ModerationStatus.CHANGES_REQUESTED) {
                await this.itemRepo.update(moderation.menuItemId, { status: 'rejected' });
            }
            return this.moderationRepo.findOne({ where: { id: moderationId } });
        }
        async bulkApprove(moderationIds, moderatorId) {
            await this.moderationRepo.update({ id: (0, typeorm_1.In)(moderationIds) }, { status: menu_moderation_entity_1.ModerationStatus.APPROVED, moderatorId, reviewedAt: new Date() });
            const moderations = await this.moderationRepo.findByIds(moderationIds);
            for (const m of moderations) {
                await this.itemRepo.update(m.menuItemId, { status: 'available' });
            }
        }
        async getModerationStats(restaurantId) {
            const where = {};
            if (restaurantId) {
                where.restaurantId = restaurantId;
            }
            const [totalPending, totalApproved, totalRejected, avgReviewTime,] = await Promise.all([
                this.moderationRepo.count({ where: { ...where, status: menu_moderation_entity_1.ModerationStatus.PENDING } }),
                this.moderationRepo.count({ where: { ...where, status: menu_moderation_entity_1.ModerationStatus.APPROVED } }),
                this.moderationRepo.count({ where: { ...where, status: menu_moderation_entity_1.ModerationStatus.REJECTED } }),
                this.getAverageReviewTime(where),
            ]);
            return {
                pending: totalPending,
                approved: totalApproved,
                rejected: totalRejected,
                avgReviewTimeHours: avgReviewTime,
            };
        }
        async getAverageReviewTime(where) {
            const result = await this.moderationRepo
                .createQueryBuilder('moderation')
                .select('AVG(TIMESTAMPDIFF(HOUR, moderation.createdAt, moderation.reviewedAt))', 'avgHours')
                .where('moderation.reviewedAt IS NOT NULL')
                .getRawOne();
            return result?.avgHours || 0;
        }
    };
    return MenuModerationService = _classThis;
})();
exports.MenuModerationService = MenuModerationService;
