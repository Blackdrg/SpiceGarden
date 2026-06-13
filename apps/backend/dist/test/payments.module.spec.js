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
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Payment Module Integration', () => {
    (0, globals_1.it)('StripeGateway has all required gateway methods', async () => {
        const { StripeGateway } = await Promise.resolve().then(() => __importStar(require('../src/services/payments/gateways/stripe-gateway.service')));
        const proto = StripeGateway.prototype;
        (0, globals_1.expect)(typeof proto.fetchPaymentDetails).toBe('function');
        (0, globals_1.expect)(typeof proto.createPaymentIntent).toBe('function');
        (0, globals_1.expect)(typeof proto.confirmPayment).toBe('function');
        (0, globals_1.expect)(typeof proto.refundPayment).toBe('function');
    });
    (0, globals_1.it)('RazorpayGateway has all required gateway methods', async () => {
        const { RazorpayGateway } = await Promise.resolve().then(() => __importStar(require('../src/services/payments/gateways/razorpay-gateway.service')));
        const proto = RazorpayGateway.prototype;
        (0, globals_1.expect)(typeof proto.fetchPaymentDetails).toBe('function');
        (0, globals_1.expect)(typeof proto.createPaymentIntent).toBe('function');
        (0, globals_1.expect)(typeof proto.refundPayment).toBe('function');
    });
    (0, globals_1.it)('CashOnDeliveryGateway has fetchPaymentDetails method', async () => {
        const { CashOnDeliveryGateway } = await Promise.resolve().then(() => __importStar(require('../src/services/payments/gateways/cod-gateway.service')));
        const proto = CashOnDeliveryGateway.prototype;
        (0, globals_1.expect)(typeof proto.fetchPaymentDetails).toBe('function');
        (0, globals_1.expect)(proto.getGatewayName()).toBe('cod');
    });
    (0, globals_1.it)('PaymentGatewayFactory provides stripe and razorpay gateways', async () => {
        const { PaymentGatewayFactory } = await Promise.resolve().then(() => __importStar(require('../src/services/payments/gateway-factory.service')));
        (0, globals_1.expect)(PaymentGatewayFactory.prototype.getGateway).toBeDefined();
        (0, globals_1.expect)(PaymentGatewayFactory.prototype.getAvailableGateways).toBeDefined();
        (0, globals_1.expect)(PaymentGatewayFactory.prototype.getAvailableGateways()).toEqual(['stripe', 'razorpay']);
    });
    (0, globals_1.it)('.env.example has all payment config variables', async () => {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const envPath = path.resolve(__dirname, '../.env.example');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const required = [
                'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
                'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
                'RAZORPAY_WEBHOOK_SECRET',
                'PAYMENT_PRIMARY_GATEWAY',
            ];
            required.forEach((v) => (0, globals_1.expect)(content).toContain(v));
        }
    });
    (0, globals_1.it)('payout service exists and has required methods', async () => {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const filePath = path.resolve(__dirname, '../src/services/restaurant/payout.service.ts');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            (0, globals_1.expect)(content).toContain('generatePayoutReport');
            (0, globals_1.expect)(content).toContain('getPayoutHistory');
            (0, globals_1.expect)(content).toContain('processPayout');
            (0, globals_1.expect)(content).toContain('getPendingPayouts');
        }
    });
    (0, globals_1.it)('payment service has required methods', async () => {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const filePath = path.resolve(__dirname, '../src/services/payments/payments.service.ts');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            (0, globals_1.expect)(content).toContain('createPaymentIntent');
            (0, globals_1.expect)(content).toContain('confirmPayment');
            (0, globals_1.expect)(content).toContain('refundPayment');
            (0, globals_1.expect)(content).toContain('constructEvent');
        }
    });
    (0, globals_1.it)('chargeback service has dispute handling methods', async () => {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const filePath = path.resolve(__dirname, '../src/services/payments/chargeback/chargeback.service.ts');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            (0, globals_1.expect)(content).toContain('handleDisputeCreated');
            (0, globals_1.expect)(content).toContain('handleDisputeClosed');
            (0, globals_1.expect)(content).toContain('getDisputeStats');
        }
    });
});
//# sourceMappingURL=payments.module.spec.js.map