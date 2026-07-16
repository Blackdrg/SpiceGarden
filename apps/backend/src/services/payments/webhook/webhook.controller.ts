
import { Controller, Post, Get, Req, HttpCode, HttpStatus, RawBodyRequest, Headers as HeadersDecorator, BadRequestException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @HeadersDecorator('stripe-signature') stripeSignature?: string,
    @HeadersDecorator('x-razorpay-signature') razorpaySignature?: string
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    
    // Determine which signature to use based on what's provided
    const signature = stripeSignature || razorpaySignature;
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }
    
    return await this.webhookService.processWebhook(rawBody, signature, req.headers);
  }

  @Get('stats')
  async getWebhookStats() {
    return await this.webhookService.getWebhookStats();
  }
}

