import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGatewayFactory } from '../src/services/payments/gateway-factory.service';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../src/services/payments/gateways/payment-gateway.interface';
import { StripeGateway } from '../src/services/payments/gateways/stripe-gateway.service';
import { RazorpayGateway } from '../src/services/payments/gateways/razorpay-gateway.service';

const createMockGateway = (name: string): jest.Mocked<PaymentGateway> => ({
  getGatewayName: jest.fn(() => name),
  createPaymentIntent: jest.fn(),
  fetchPaymentDetails: jest.fn(),
  confirmPayment: jest.fn(),
  refundPayment: jest.fn(),
  constructEvent: jest.fn(),
});

async function createFactoryModule(primaryGateway: string): Promise<{ module: TestingModule; factory: PaymentGatewayFactory; configService: jest.Mocked<ConfigService> }> {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'PAYMENT_PRIMARY_GATEWAY') return primaryGateway;
      return undefined;
    }),
  } as any;

  const module = await Test.createTestingModule({
    providers: [
      PaymentGatewayFactory,
      { provide: ConfigService, useValue: configService },
      { provide: StripeGateway, useValue: createMockGateway('stripe') },
      { provide: RazorpayGateway, useValue: createMockGateway('razorpay') },
    ],
  }).compile();

  const factory = module.get(PaymentGatewayFactory);

  return { module, factory, configService };
}

describe('PaymentGatewayFactory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    const { factory } = await createFactoryModule('stripe');
    expect(factory).toBeDefined();
  });

  it('should use stripe as default gateway', async () => {
    const { factory } = await createFactoryModule('stripe');

    const gateway = factory.getGateway();

    expect(gateway.getGatewayName()).toBe('stripe');
  });

  it('should use razorpay as default when configured', async () => {
    const { factory } = await createFactoryModule('razorpay');

    const gateway = factory.getGateway();

    expect(gateway.getGatewayName()).toBe('razorpay');
  });

  it('should return stripe gateway by name', async () => {
    const { factory } = await createFactoryModule('stripe');

    const gateway = factory.getGateway('stripe');

    expect(gateway.getGatewayName()).toBe('stripe');
  });

  it('should return razorpay gateway by name', async () => {
    const { factory } = await createFactoryModule('razorpay');

    const gateway = factory.getGateway('razorpay');

    expect(gateway.getGatewayName()).toBe('razorpay');
  });

  it('should return default gateway for unknown gateway name', async () => {
    const { factory } = await createFactoryModule('stripe');

    const gateway = factory.getGateway('unknown-gateway');

    expect(gateway.getGatewayName()).toBe('stripe');
  });

  it('should return default gateway when no name provided', async () => {
    const { factory } = await createFactoryModule('stripe');

    const gateway = factory.getGateway();

    expect(gateway.getGatewayName()).toBe('stripe');
  });

  it('should be case-insensitive for gateway name', async () => {
    const { factory } = await createFactoryModule('stripe');

    const gateway = factory.getGateway('STRIPE');

    expect(gateway.getGatewayName()).toBe('stripe');
  });

  it('should list available gateways', async () => {
    const { factory } = await createFactoryModule('stripe');

    const gateways = factory.getAvailableGateways();

    expect(gateways.map((g: any) => g.name)).toContain('stripe');
    expect(gateways.map((g: any) => g.name)).toContain('razorpay');
    expect(gateways.length).toBeGreaterThanOrEqual(2);
  });
});
