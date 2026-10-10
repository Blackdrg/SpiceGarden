import { ConfigService } from '@nestjs/config';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { CashOnDeliveryGateway } from './gateways/cod-gateway.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';
export declare class PaymentGatewayFactory {
    private configService;
    private stripeGatewayInstance;
    private razorpayGatewayInstance;
    private codGatewayInstance;
    private readonly logger;
    private stripeGateway;
    private razorpayGateway;
    private codGateway;
    private defaultGateway;
    constructor(configService: ConfigService, stripeGatewayInstance: StripeGateway, razorpayGatewayInstance: RazorpayGateway, codGatewayInstance: CashOnDeliveryGateway);
    getGateway(gatewayName?: string): PaymentGateway;
    getAvailableGateways(): string[];
}
