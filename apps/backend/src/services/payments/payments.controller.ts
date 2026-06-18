
import { Controller, Post, Body, Headers, Req, BadRequestException, RawBodyRequest, HttpCode, HttpStatus, Get, Query, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payments.service';
import { PaymentHardeningService } from './payment-hardening.service';
import { RetryService, RetryResult } from './retry.service';
import { FraudHardeningService, FraudCheckResult } from './fraud-hardening.service';
import { IdempotencyService } from './idempotency.service';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private paymentService: PaymentService,
    private paymentHardening: PaymentHardeningService,
    private retryService: RetryService,
    private fraudHardening: FraudHardeningService,
    private idempotency: IdempotencyService,
    private configService: ConfigService,
  ) {}

  @Post('create-intent')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPaymentIntent(
    @Body() body: any,
    @Req() req: Request,
    @Headers('x-idempotency-key') idempotencyKey?: string,
    @Query('gateway') gateway?: string // Optional gateway parameter
  ) {
    const fraudCheck = await this.fraudHardening.checkPaymentFraud({
      userId: body.userId,
      amount: body.amount,
      ipAddress: req.ip || req.connection.remoteAddress || '0.0.0.0',
      userAgent: req.get('User-Agent') || 'any',
    });

    if (!fraudCheck.allowed) {
      return {
        error: 'Payment blocked due to fraud risk',
        reasons: fraudCheck.reasons,
        riskScore: fraudCheck.riskScore,
      };
    }

    const retryResult: RetryResult<any> = await this.retryService.executeWithRetry(
      async () => {
        if (idempotencyKey) {
          const existing = await this.idempotency.validateOrCreate(
            idempotencyKey,
            'create_payment_intent',
            body.userId,
            { amount: body.amount, currency: body.currency }
          );

          if (existing.isDuplicate) {
            return existing.response;
          }
        }

        const intent = await this.paymentService.createPaymentIntent(
          body.amount,
          body.currency || 'usd',
          body.userId,
          { orderId: body.orderId, paymentMethodId: body.paymentMethodId },
          req,
          gateway
        );

        if (idempotencyKey) {
          await this.idempotency.complete(idempotencyKey, 'create_payment_intent', intent);
        }

        return intent;
      },
      'create_payment_intent',
      { userId: body.userId, orderId: body.orderId }
    );

    if (!retryResult.success) {
      throw new BadRequestException(retryResult.error?.message);
    }

    // Return client secret for frontend
    return { 
      clientSecret: retryResult.result?.client_secret || retryResult.result?.id,
      gateway: gateway || this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe')
    };
  }

  @Post('refund')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async refund(
    @Body() body: any,
    @Headers('x-idempotency-key') idempotencyKey?: string,
    @Query('gateway') gateway?: string // Optional gateway parameter
  ) {
    const retryResult = await this.retryService.executeWithRetry(
      async () => {
        if (idempotencyKey) {
          const existing = await this.idempotency.validateOrCreate(
            idempotencyKey,
            'refund_payment',
            body.userId,
            { paymentIntentId: body.paymentIntentId, amount: body.amount }
          );

          if (existing.isDuplicate) {
            return existing.response;
          }
        }

        const refund = await this.paymentService.refundPayment(
          body.paymentIntentId,
          body.amount,
          body.userId,
          body.reason,
          undefined, // request object not needed for refunds in this context
          gateway
        );

        if (idempotencyKey) {
          await this.idempotency.complete(idempotencyKey, 'refund_payment', refund);
        }

        return refund;
      },
      'refund_payment',
      { userId: body.userId, paymentId: body.paymentIntentId }
    );

    if (!retryResult.success) {
      throw new BadRequestException(retryResult.error?.message);
    }

    return retryResult.result;
  }

  @Get('gateways')
  @Roles(UserRole.CUSTOMER, UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available payment gateways' })
  @ApiResponse({ status: 200, description: 'List of available payment gateways' })
  getAvailableGateways() {
    // In a real implementation, this would come from the gateway factory
    // For now, we'll return the hardcoded list
    return ['stripe', 'razorpay'];
  }

  @Get('gateway/config')
  @Roles(UserRole.CUSTOMER, UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment gateway configuration' })
  @ApiResponse({ status: 200, description: 'Payment gateway configuration' })
  getGatewayConfig() {
    return {
      primaryGateway: this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe'),
      availableGateways: ['stripe', 'razorpay'],
      stripeEnabled: !!this.configService.get<string>('STRIPE_SECRET_KEY'),
      razorpayEnabled: !!this.configService.get<string>('RAZORPAY_KEY_ID')
    };
  }
}

