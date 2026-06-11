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
exports.TicketRoutingService = void 0;
const common_1 = require("@nestjs/common");
const support_ticket_entity_1 = require("../../db/entities/support-ticket.entity");
let TicketRoutingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TicketRoutingService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TicketRoutingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        ticketRepo;
        userRepo;
        dataSource;
        logger = new common_1.Logger(TicketRoutingService.name);
        categoryRules = new Map([
            [support_ticket_entity_1.TicketCategory.ORDER, ['support_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.PAYMENT, ['finance_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.DELIVERY, ['delivery_coordinator', 'admin']],
            [support_ticket_entity_1.TicketCategory.QUALITY, ['quality_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.ACCOUNT, ['support_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.TECHNICAL, ['tech_support', 'admin']],
        ]);
        prioritySLA = new Map([
            [support_ticket_entity_1.TicketPriority.LOW, 48],
            [support_ticket_entity_1.TicketPriority.MEDIUM, 24],
            [support_ticket_entity_1.TicketPriority.HIGH, 4],
            [support_ticket_entity_1.TicketPriority.URGENT, 1],
        ]);
        constructor(ticketRepo, userRepo, dataSource) {
            this.ticketRepo = ticketRepo;
            this.userRepo = userRepo;
            this.dataSource = dataSource;
        }
        async routeTicket(ticketId) {
            const ticket = await this.ticketRepo.findOne({
                where: { id: ticketId },
                relations: ['assignedTo'],
            });
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            if (ticket.assignedToId) {
                return ticket;
            }
            const eligibleRoles = this.categoryRules.get(ticket.category) || ['support_agent'];
            const availableAgent = await this.findAvailableAgent(eligibleRoles, ticket.priority);
            if (availableAgent) {
                await this.ticketRepo.update(ticketId, {
                    assignedToId: availableAgent.id,
                    status: support_ticket_entity_1.TicketStatus.IN_PROGRESS,
                });
            }
            else {
                await this.ticketRepo.update(ticketId, {
                    status: support_ticket_entity_1.TicketStatus.OPEN,
                });
            }
            return this.ticketRepo.findOne({ where: { id: ticketId } });
        }
        async findAvailableAgent(roles, priority) {
            const agents = await this.userRepo.find({
                where: { role: 1 },
                order: { createdAt: 'ASC' },
            });
            return agents[0] || null;
        }
        async escalateTicket(ticketId, escalationLevel = 1) {
            const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            const newLevel = (ticket.escalationLevel || 0) + 1;
            const escalatedTo = this.getEscalationTarget(newLevel);
            await this.ticketRepo.update(ticketId, {
                escalated: true,
                escalationLevel: newLevel,
                escalatedToId: escalatedTo,
                escalatedAt: new Date(),
                priority: this.getEscalatedPriority(ticket.priority, newLevel),
            });
            return this.ticketRepo.findOne({ where: { id: ticketId } });
        }
        getEscalationTarget(level) {
            const targets = ['senior_agent', 'team_lead', 'manager', 'admin'];
            return targets[Math.min(level, targets.length) - 1];
        }
        getEscalatedPriority(current, level) {
            const priorityOrder = [support_ticket_entity_1.TicketPriority.LOW, support_ticket_entity_1.TicketPriority.MEDIUM, support_ticket_entity_1.TicketPriority.HIGH, support_ticket_entity_1.TicketPriority.URGENT];
            const currentIndex = priorityOrder.indexOf(current);
            return priorityOrder[Math.min(currentIndex + level, priorityOrder.length - 1)];
        }
        async autoAssignBySLA() {
            const unassignedTickets = await this.ticketRepo.find({
                where: { status: support_ticket_entity_1.TicketStatus.OPEN },
            });
            for (const ticket of unassignedTickets) {
                await this.routeTicket(ticket.id);
            }
        }
        async getQueueStats() {
            const [openTickets, inProgress, awaitingCustomer, byPriority,] = await Promise.all([
                this.ticketRepo.count({ where: { status: support_ticket_entity_1.TicketStatus.OPEN } }),
                this.ticketRepo.count({ where: { status: support_ticket_entity_1.TicketStatus.IN_PROGRESS } }),
                this.ticketRepo.count({ where: { status: support_ticket_entity_1.TicketStatus.AWAITING_CUSTOMER } }),
                this.getTicketsByPriority(),
            ]);
            return {
                open: openTickets,
                inProgress,
                awaitingCustomer,
                byPriority,
            };
        }
        async getTicketsByPriority() {
            const counts = {};
            for (const priority of Object.values(support_ticket_entity_1.TicketPriority)) {
                counts[priority] = await this.ticketRepo.count({ where: { priority } });
            }
            return counts;
        }
        async getOverdueTickets() {
            return this.ticketRepo.find({
                where: { status: support_ticket_entity_1.TicketStatus.IN_PROGRESS },
            });
        }
    };
    return TicketRoutingService = _classThis;
})();
exports.TicketRoutingService = TicketRoutingService;
