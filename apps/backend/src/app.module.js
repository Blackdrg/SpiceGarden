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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const db_module_1 = require("./db/db.module");
const security_module_1 = require("./security/security.module");
const logging_module_1 = require("./logging/logging.module");
const queue_module_1 = require("./infra/queue/queue.module");
const tracking_module_1 = require("./infra/tracking/tracking.module");
const auth_module_1 = require("./services/auth/auth.module");
const order_module_1 = require("./services/order/order.module");
const payments_module_1 = require("./services/payments/payments.module");
const restaurant_module_1 = require("./services/restaurant/restaurant.module");
const search_module_1 = require("./services/search/search.module");
const delivery_module_1 = require("./services/delivery/delivery.module");
const driver_ops_module_1 = require("./services/delivery/driver-ops.module");
const admin_module_1 = require("./services/admin/admin.module");
const notification_module_1 = require("./services/notifications/notification.module");
const kitchen_module_1 = require("./modules/kitchen/kitchen.module");
const driver_assignment_module_1 = require("./modules/driver-assignment/driver-assignment.module");
const metrics_module_1 = require("./metrics/metrics.module");
const compliance_module_1 = require("./compliance/compliance.module");
const audit_module_1 = require("./audit/audit.module");
const wallet_module_1 = require("./services/wallet/wallet.module");
const gst_module_1 = require("./services/gst/gst.module");
const finance_module_1 = require("./services/finance/finance.module");
const support_module_1 = require("./services/support/support.module");
const refund_module_1 = require("./services/refund/refund.module");
const loyalty_module_1 = require("./services/loyalty/loyalty.module");
const driver_fleet_module_1 = require("./services/driver-fleet/driver-fleet.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const review_module_1 = require("./services/review/review.module");
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env'],
                }),
                db_module_1.DbModule,
                security_module_1.SecurityModule,
                logging_module_1.LoggingModule,
                queue_module_1.QueueModule,
                tracking_module_1.TrackingModule,
                auth_module_1.AuthServiceModule,
                order_module_1.OrderServiceModule,
                payments_module_1.PaymentServiceModule,
                restaurant_module_1.RestaurantServiceModule,
                search_module_1.SearchServiceModule,
                delivery_module_1.DeliveryServiceModule,
                driver_ops_module_1.DriverOpsModule,
                admin_module_1.AdminServiceModule,
                notification_module_1.NotificationModule,
                kitchen_module_1.KitchenModule,
                driver_assignment_module_1.DriverAssignmentModule,
                metrics_module_1.MetricsModule,
                compliance_module_1.ComplianceModule,
                audit_module_1.AuditModule,
                wallet_module_1.WalletModule,
                gst_module_1.GSTModule,
                finance_module_1.FinanceModule,
                support_module_1.SupportModule,
                refund_module_1.RefundModule,
                loyalty_module_1.LoyaltyModule,
                driver_fleet_module_1.DriverFleetModule,
                analytics_module_1.AnalyticsModule,
                review_module_1.ReviewServiceModule,
            ],
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
