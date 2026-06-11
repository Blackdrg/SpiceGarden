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
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const commission_rule_entity_1 = require("../../db/entities/commission-rule.entity");
let CommissionService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CommissionService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CommissionService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        commissionRepo;
        restaurantRepo;
        dataSource;
        logger = new common_1.Logger(CommissionService.name);
        constructor(commissionRepo, restaurantRepo, dataSource) {
            this.commissionRepo = commissionRepo;
            this.restaurantRepo = restaurantRepo;
            this.dataSource = dataSource;
        }
        async createCommissionRule(restaurantId, ruleData) {
            const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
            if (!restaurant) {
                throw new common_1.NotFoundException('Restaurant not found');
            }
            if (ruleData.value <= 0) {
                throw new common_1.BadRequestException('Commission value must be greater than zero');
            }
            const rule = this.commissionRepo.create({
                restaurantId,
                ...ruleData,
            });
            return this.commissionRepo.save(rule);
        }
        async getCommissionRules(restaurantId, activeOnly = true) {
            const where = { restaurantId: restaurantId };
            if (activeOnly) {
                where.status = commission_rule_entity_1.CommissionStatus.ACTIVE;
            }
            return this.commissionRepo.find({
                where,
                order: { createdAt: 'DESC' },
            });
        }
        async calculateCommission(restaurantId, orderAmount, categoryId) {
            const rules = await this.commissionRepo.find({
                where: {
                    restaurantId: restaurantId,
                    status: commission_rule_entity_1.CommissionStatus.ACTIVE,
                },
            });
            let applicableRule = null;
            for (const rule of rules) {
                if (rule.minOrderValue && orderAmount < rule.minOrderValue)
                    continue;
                if (rule.maxOrderValue && orderAmount > rule.maxOrderValue)
                    continue;
                if (categoryId && rule.applicableCategories?.length && !rule.applicableCategories.includes(categoryId))
                    continue;
                applicableRule = rule;
                break;
            }
            if (!applicableRule) {
                return orderAmount * 0.15;
            }
            if (applicableRule.type === commission_rule_entity_1.CommissionType.PERCENTAGE) {
                return orderAmount * (Number(applicableRule.value) / 100);
            }
            return Number(applicableRule.value);
        }
        async updateCommissionRule(ruleId, updateData) {
            const rule = await this.commissionRepo.findOne({ where: { id: ruleId } });
            if (!rule) {
                throw new common_1.NotFoundException('Commission rule not found');
            }
            await this.commissionRepo.update(ruleId, updateData);
            return this.commissionRepo.findOne({ where: { id: ruleId } });
        }
        async deactivateRule(ruleId) {
            return this.updateCommissionRule(ruleId, { status: commission_rule_entity_1.CommissionStatus.CANCELLED });
        }
        async getCommissionHistory(restaurantId, limit = 20) {
            // This would typically aggregate from orders/payouts
            const rules = await this.commissionRepo.find({
                where: { restaurantId: restaurantId },
                order: { createdAt: 'DESC' },
                take: limit,
            });
            return rules.map(rule => ({
                ruleId: rule.id,
                type: rule.type,
                value: rule.value,
                createdAt: rule.createdAt,
            }));
        }
    };
    return CommissionService = _classThis;
})();
exports.CommissionService = CommissionService;
