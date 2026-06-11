"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const order_interface_1 = require("../../shared/domain/order.interface");
const crypto = __importStar(require("crypto"));
let OrderService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OrderService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OrderService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderRepo;
        paymentService;
        notificationService;
        retryService;
        idempotency;
        productionNotification;
        loggingService;
        constructor(orderRepo, paymentService, notificationService, retryService, idempotency, productionNotification, loggingService) {
            this.orderRepo = orderRepo;
            this.paymentService = paymentService;
            this.notificationService = notificationService;
            this.retryService = retryService;
            this.idempotency = idempotency;
            this.productionNotification = productionNotification;
            this.loggingService = loggingService;
        }
        validateOrderItems(items) {
            if (!Array.isArray(items) || items.length === 0) {
                throw new common_1.BadRequestException('Order must contain at least one item');
            }
            for (const item of items) {
                if (!item || typeof item !== 'object') {
                    throw new common_1.BadRequestException('Invalid order item');
                }
                const anyItem = item;
                if (!anyItem.id || typeof anyItem.id !== 'string' || anyItem.id.trim().length === 0) {
                    throw new common_1.BadRequestException('Invalid order item ID');
                }
                if (!anyItem.name || typeof anyItem.name !== 'string' || anyItem.name.trim().length === 0) {
                    throw new common_1.BadRequestException('Invalid order item name');
                }
                if (typeof anyItem.price !== 'number' || !Number.isFinite(anyItem.price) || anyItem.price < 0) {
                    throw new common_1.BadRequestException('Invalid order item price');
                }
                if (!Number.isInteger(anyItem.quantity) || anyItem.quantity < 1) {
                    throw new common_1.BadRequestException('Invalid order item quantity');
                }
            }
        }
        validateOrderTotals(orderData) {
            const subtotal = Number(orderData.subtotal) || 0;
            const tax = Number(orderData.tax) || 0;
            const deliveryFee = Number(orderData.deliveryFee) || 0;
            const grandTotal = Number(orderData.grandTotal);
            if (!Number.isFinite(subtotal) || subtotal < 0) {
                throw new common_1.BadRequestException('Invalid subtotal');
            }
            if (!Number.isFinite(tax) || tax < 0) {
                throw new common_1.BadRequestException('Invalid tax');
            }
            if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
                throw new common_1.BadRequestException('Invalid delivery fee');
            }
            if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
                throw new common_1.BadRequestException('Order total must be greater than zero');
            }
            const expectedTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
            if (Math.abs(expectedTotal - grandTotal) > 0.01) {
                throw new common_1.BadRequestException('Order total does not match items');
            }
            return true;
        }
        async placeOrder(orderData, idempotencyKey) {
            if (!orderData.userId || !orderData.restaurantId || !orderData.grandTotal) {
                throw new common_1.BadRequestException('Missing required order data: userId, restaurantId, or grandTotal');
            }
            if (orderData.items) {
                this.validateOrderItems(orderData.items);
            }
            this.validateOrderTotals(orderData);
            if (idempotencyKey) {
                const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'place_order', orderData.userId, { restaurantId: orderData.restaurantId, grandTotal: orderData.grandTotal });
                if (existing.isDuplicate && existing.response) {
                    return existing.response;
                }
            }
            const orderId = crypto.randomUUID();
            const now = new Date();
            const order = {
                id: orderId,
                userId: orderData.userId,
                restaurantId: orderData.restaurantId,
                driverId: orderData.driverId,
                orderNumber: `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${orderId.slice(0, 6).toUpperCase()}`,
                status: order_interface_1.OrderStatus.PLACED,
                paymentStatus: order_interface_1.PaymentStatus.PENDING,
                subtotal: Number(orderData.subtotal) || 0,
                tax: Number(orderData.tax) || 0,
                deliveryFee: Number(orderData.deliveryFee) || 0,
                discount: Number(orderData.discount) || 0,
                tip: Number(orderData.tip) || 0,
                grandTotal: Number(orderData.grandTotal),
                couponId: orderData.couponId,
                deliveryAddressId: orderData.deliveryAddressId || '',
                createdAt: now,
                updatedAt: now,
            };
            try {
                const savedOrder = await this.orderRepo.save(order);
                if (idempotencyKey) {
                    await this.idempotency.complete(idempotencyKey, 'place_order', savedOrder);
                }
                return savedOrder;
            }
            catch (error) {
                this.loggingService.secureError('[OrderService] Failed to place order', error, 'OrderService');
                if (error?.code === '23505') {
                    throw new common_1.ConflictException('Order creation failed due to duplicate');
                }
                throw new common_1.InternalServerErrorException('Order placement failed due to internal processing error');
            }
        }
        async confirmPayment(orderId, paymentId, request) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            if (order.paymentStatus === order_interface_1.PaymentStatus.COMPLETED) {
                throw new common_1.ConflictException('Payment already confirmed for this order');
            }
            try {
                const paymentIntent = await this.paymentService.confirmPayment(paymentId, order.userId, request);
                order.paymentStatus = order_interface_1.PaymentStatus.COMPLETED;
                order.status = order_interface_1.OrderStatus.PAYMENT_CONFIRMED;
                order.updatedAt = new Date();
                const savedOrder = await this.orderRepo.save(order);
                await this.notificationService.sendPush(order.userId, 'Payment Confirmed', `Your payment for order #${order.orderNumber} has been confirmed.`, { orderId: order.id });
                return savedOrder;
            }
            catch (error) {
                this.loggingService.secureError('[OrderService] Payment confirmation failed', error, 'OrderService');
                order.paymentStatus = order_interface_1.PaymentStatus.FAILED;
                order.updatedAt = new Date();
                await this.orderRepo.save(order);
                throw error;
            }
        }
        async handleWebhookDelayed(orderId, paymentId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            if (order.paymentStatus === order_interface_1.PaymentStatus.COMPLETED) {
                return order;
            }
            if (order.paymentStatus === order_interface_1.PaymentStatus.FAILED) {
                return order;
            }
            return this.confirmPayment(orderId, paymentId);
        }
        async refundAfterDispatch(orderId, reason) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            const refundEligibleStatuses = [
                order_interface_1.OrderStatus.ON_THE_WAY,
                order_interface_1.OrderStatus.DELIVERED,
            ];
            if (!refundEligibleStatuses.includes(order.status)) {
                throw new common_1.BadRequestException(`Refund not allowed for order in ${order.status} status`);
            }
            if (order.paymentStatus === order_interface_1.PaymentStatus.REFUNDED) {
                throw new common_1.ConflictException('Order already refunded');
            }
            try {
                const refund = await this.paymentService.refundPayment(order.id, order.grandTotal, order.userId, reason);
                order.paymentStatus = order_interface_1.PaymentStatus.REFUNDED;
                order.updatedAt = new Date();
                const savedOrder = await this.orderRepo.save(order);
                await this.notificationService.sendPush(order.userId, 'Refund Initiated', `A refund has been initiated for order #${order.orderNumber}. Reason: ${reason}`, { orderId: order.id });
                return savedOrder;
            }
            catch (error) {
                this.loggingService.secureError('[OrderService] Refund failed', error, 'OrderService');
                throw new common_1.InternalServerErrorException('Refund processing failed');
            }
        }
        async cancelByDriver(orderId, driverId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            if (order.driverId !== driverId) {
                throw new common_1.BadRequestException('Driver not assigned to this order');
            }
            const cancellableStatuses = [
                order_interface_1.OrderStatus.DRIVER_ASSIGNED,
                order_interface_1.OrderStatus.PICKED_UP,
                order_interface_1.OrderStatus.ON_THE_WAY,
            ];
            if (!cancellableStatuses.includes(order.status)) {
                throw new common_1.BadRequestException(`Order cannot be cancelled by driver in ${order.status} status`);
            }
            try {
                order.status = order_interface_1.OrderStatus.CANCELLED;
                order.driverId = null;
                order.updatedAt = new Date();
                const savedOrder = await this.orderRepo.save(order);
                await this.notificationService.sendPush(order.userId, 'Order Cancelled by Driver', `Your order #${order.orderNumber} has been cancelled by the driver.`, { orderId: order.id });
                return savedOrder;
            }
            catch (error) {
                this.loggingService.secureError('[OrderService] Driver cancellation failed', error, 'OrderService');
                throw new common_1.InternalServerErrorException('Driver cancellation failed');
            }
        }
        async cancelByKitchen(orderId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            const cancellableStatuses = [
                order_interface_1.OrderStatus.RESTAURANT_ACCEPTED,
                order_interface_1.OrderStatus.PREPARING,
            ];
            if (!cancellableStatuses.includes(order.status)) {
                throw new common_1.BadRequestException(`Kitchen cannot cancel order in ${order.status} status`);
            }
            try {
                order.status = order_interface_1.OrderStatus.CANCELLED;
                order.updatedAt = new Date();
                const savedOrder = await this.orderRepo.save(order);
                await this.notificationService.sendPush(order.userId, 'Order Cancelled by Restaurant', `Your order #${order.orderNumber} has been cancelled by the restaurant.`, { orderId: order.id });
                return savedOrder;
            }
            catch (error) {
                this.loggingService.secureError('[OrderService] Kitchen cancellation failed', error, 'OrderService');
                throw new common_1.InternalServerErrorException('Kitchen cancellation failed');
            }
        }
        async preventDoubleDispatch(orderId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            if (order.driverId && order.status === order_interface_1.OrderStatus.DRIVER_ASSIGNED) {
                throw new common_1.ConflictException('Driver already assigned to this order');
            }
            return order;
        }
        async retryOrder(orderId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            if (order.paymentStatus !== order_interface_1.PaymentStatus.FAILED) {
                throw new common_1.BadRequestException('Order can only be retried for failed payments');
            }
            try {
                order.status = order_interface_1.OrderStatus.PLACED;
                order.paymentStatus = order_interface_1.PaymentStatus.PENDING;
                order.updatedAt = new Date();
                const savedOrder = await this.orderRepo.save(order);
                return savedOrder;
            }
            catch (error) {
                this.loggingService.secureError('[OrderService] Order retry failed', error, 'OrderService');
                throw new common_1.InternalServerErrorException('Order retry failed');
            }
        }
        async resolveStuckPreparingState() {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const stuckOrders = await this.orderRepo.find({
                where: {
                    status: order_interface_1.OrderStatus.PREPARING,
                    updatedAt: (0, typeorm_1.LessThan)(thirtyMinutesAgo),
                },
            });
            const resolvedOrders = [];
            for (const order of stuckOrders) {
                try {
                    order.status = order_interface_1.OrderStatus.RESTAURANT_ACCEPTED;
                    order.updatedAt = new Date();
                    const savedOrder = await this.orderRepo.save(order);
                    resolvedOrders.push(savedOrder);
                    await this.notificationService.sendPush(order.userId, 'Order Delayed', `Your order #${order.orderNumber} is experiencing delays. We're working on it.`, { orderId: order.id });
                }
                catch (error) {
                    this.loggingService.secureError('[OrderService] Failed to resolve stuck preparing state for order', { id: order.id, error }, 'OrderService');
                }
            }
            return resolvedOrders;
        }
        async getOrderWithLock(orderId) {
            const order = await this.orderRepo.findOne({
                where: { id: orderId },
                lock: { mode: 'pessimistic_write' }
            });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            }
            return order;
        }
    };
    return OrderService = _classThis;
})();
exports.OrderService = OrderService;
