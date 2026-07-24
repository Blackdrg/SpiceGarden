
import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { GooglePayGateway } from './gateways/googlepay-gateway.service';
import { PhonePeGateway } from './gateways/phonepe-gateway.service';
import { PaytmGateway } from './gateways/paytm-gateway.service';
import { BhimUpiGateway } from './gateways/bhim-upi-gateway.service';
import { NetBankingGateway } from './gateways/netbanking-gateway.service';
import { EmiGateway } from './gateways/emi-gateway.service';
import { SplitPaymentGateway } from './gateways/split-payment-gateway.service';
import { CashOnDeliveryGateway } from './gateways/cod-gateway.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';

@Injectable()
export class PaymentGatewayFactory {
  private readonly logger = new Logger(PaymentGatewayFactory.name);
  
  private stripeGateway: StripeGateway;
  private razorpayGateway: RazorpayGateway;
  private gatewayMap: Map<string, PaymentGateway>;

  constructor(
    private configService: ConfigService,
    private stripeGatewayInstance: StripeGateway,
    private razorpayGatewayInstance: RazorpayGateway,
    @Optional() private googlePayGatewayInstance?: GooglePayGateway,
    @Optional() private phonePeGatewayInstance?: PhonePeGateway,
    @Optional() private paytmGatewayInstance?: PaytmGateway,
    @Optional() private bhimUpiGatewayInstance?: BhimUpiGateway,
    @Optional() private netBankingGatewayInstance?: NetBankingGateway,
    @Optional() private emiGatewayInstance?: EmiGateway,
    @Optional() private splitPaymentGatewayInstance?: SplitPaymentGateway,
    @Optional() private codGatewayInstance?: CashOnDeliveryGateway,
  ) {
    this.stripeGateway = this.stripeGatewayInstance;
    this.razorpayGateway = this.razorpayGatewayInstance;

    this.gatewayMap = new Map<string, PaymentGateway>([
      ['stripe', this.stripeGateway],
      ['razorpay', this.razorpayGateway],
    ]);

    if (this.googlePayGatewayInstance) this.gatewayMap.set('google_pay', this.googlePayGatewayInstance);
    if (this.phonePeGatewayInstance) this.gatewayMap.set('phonepe', this.phonePeGatewayInstance);
    if (this.paytmGatewayInstance) this.gatewayMap.set('paytm', this.paytmGatewayInstance);
    if (this.bhimUpiGatewayInstance) this.gatewayMap.set('bhim_upi', this.bhimUpiGatewayInstance);
    if (this.netBankingGatewayInstance) this.gatewayMap.set('net_banking', this.netBankingGatewayInstance);
    if (this.emiGatewayInstance) this.gatewayMap.set('emi', this.emiGatewayInstance);
    if (this.splitPaymentGatewayInstance) this.gatewayMap.set('split_payment', this.splitPaymentGatewayInstance);
    if (this.codGatewayInstance) this.gatewayMap.set('cod', this.codGatewayInstance);

    const primaryGateway = this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe');
    const defaultGateway = this.gatewayMap.get(primaryGateway) || this.stripeGateway;
    this.logger.log(`Payment gateway factory initialized with ${this.gatewayMap.size} gateways. Default: ${defaultGateway.getGatewayName()}`);
  }

  getGateway(gatewayName?: string): PaymentGateway {
    if (!gatewayName) {
      const primaryGateway = this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe');
      return this.gatewayMap.get(primaryGateway) || this.stripeGateway;
    }
    
    const gateway = this.gatewayMap.get(gatewayName.toLowerCase());
    if (gateway) return gateway;
    
    this.logger.warn(`Unknown payment gateway: ${gatewayName}, falling back to default`);
    const primaryGateway = this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe');
    return this.gatewayMap.get(primaryGateway) || this.stripeGateway;
  }

  getAvailableGateways(): { name: string; label: string; methods: string[] }[] {
    const available: { name: string; label: string; methods: string[] }[] = [
      { name: 'stripe', label: 'Credit/Debit Card (Stripe)', methods: ['card', 'visa', 'mastercard', 'amex'] },
      { name: 'razorpay', label: 'Razorpay', methods: ['card', 'wallet', 'upi', 'netbanking'] },
    ];

    if (this.googlePayGatewayInstance) available.push({ name: 'google_pay', label: 'Google Pay', methods: ['upi'] });
    if (this.phonePeGatewayInstance) available.push({ name: 'phonepe', label: 'PhonePe', methods: ['upi', 'card'] });
    if (this.paytmGatewayInstance) available.push({ name: 'paytm', label: 'Paytm', methods: ['upi', 'wallet', 'card'] });
    if (this.bhimUpiGatewayInstance) available.push({ name: 'bhim_upi', label: 'BHIM UPI', methods: ['upi'] });
    if (this.netBankingGatewayInstance) available.push({ name: 'net_banking', label: 'Net Banking', methods: ['netbanking'] });
    if (this.emiGatewayInstance) available.push({ name: 'emi', label: 'EMI', methods: ['card'] });
    if (this.splitPaymentGatewayInstance) available.push({ name: 'split_payment', label: 'Split Payment', methods: ['card', 'upi', 'wallet'] });
    if (this.codGatewayInstance) available.push({ name: 'cod', label: 'Cash on Delivery', methods: ['cash'] });

    return available;
  }
}
