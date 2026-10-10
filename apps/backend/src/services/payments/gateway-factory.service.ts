
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { CashOnDeliveryGateway } from './gateways/cod-gateway.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';

@Injectable()
export class PaymentGatewayFactory {
  private readonly logger = new Logger(PaymentGatewayFactory.name);
  
  private stripeGateway: StripeGateway;
  private razorpayGateway: RazorpayGateway;
  private codGateway: CashOnDeliveryGateway;
  
  private defaultGateway: PaymentGateway;

  constructor(
    private configService: ConfigService,
    private stripeGatewayInstance: StripeGateway,
    private razorpayGatewayInstance: RazorpayGateway,
    private codGatewayInstance: CashOnDeliveryGateway
  ) {
    this.stripeGateway = this.stripeGatewayInstance;
    this.razorpayGateway = this.razorpayGatewayInstance;
    this.codGateway = this.codGatewayInstance;
    
    // Determine default gateway based on configuration
    const primaryGateway = this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe');
    if (primaryGateway === 'cod') {
      this.defaultGateway = this.codGateway;
    } else if (primaryGateway === 'razorpay') {
      this.defaultGateway = this.razorpayGateway;
    } else {
      this.defaultGateway = this.stripeGateway;
    }

    this.logger.log(`Payment gateway factory initialized with default gateway: ${this.defaultGateway.getGatewayName()}`);
  }

  getGateway(gatewayName?: string): PaymentGateway {
    if (!gatewayName) {
      return this.defaultGateway;
    }
    
    switch (gatewayName.toLowerCase()) {
      case 'cod':
      case 'cash_on_delivery':
        return this.codGateway;
      case 'stripe':
        return this.stripeGateway;
      case 'razorpay':
        return this.razorpayGateway;
      default:
        this.logger.warn(`Unknown payment gateway: ${gatewayName}, falling back to default`);
        return this.defaultGateway;
    }
  }

  getAvailableGateways(): string[] {
    return ['stripe', 'razorpay', 'cod'];
  }
}
