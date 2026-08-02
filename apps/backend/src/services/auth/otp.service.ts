import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserEntity } from '../../db/entities/user.entity';
import { OtpEntity, OtpType, OtpStatus } from '../../db/entities/otp.entity';
import { NotificationService } from '../notifications/notification.service';
import { AuthService, AuthenticatedUser, MfaLoginTokenResponse } from './auth.service';

export interface OtpRequestResult {
  message: string;
}

export interface OtpVerifyResult extends Partial<MfaLoginTokenResponse> {
  mfaRequired?: boolean;
  email?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: UserEntity['role'];
    status: UserEntity['status'];
  };
}

const GENERIC_MESSAGE =
  'If an account exists for this email, a one-time login code has been sent.';

@Injectable()
export class OtpService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private readonly otpRepo: Repository<OtpEntity>,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}

  private generateCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private getExpiryMs(): number {
    const minutes = Number(this.configService.get<number>('OTP_EXPIRY_MINUTES', 10));
    return minutes * 60 * 1000;
  }

  /**
   * Passwordless login: generate a one-time code for an existing user and
   * deliver it over SMS (preferred) or email. Always returns a generic
   * message so callers cannot enumerate registered accounts.
   */
  async requestOtp(email: string): Promise<OtpRequestResult> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return { message: GENERIC_MESSAGE };
    }

    // Invalidate any outstanding login codes before issuing a new one.
    await this.otpRepo.update(
      { userId: user.id, type: OtpType.LOGIN, status: OtpStatus.PENDING },
      { status: OtpStatus.EXPIRED },
    );

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + this.getExpiryMs());

    await this.otpRepo.save({
      userId: user.id,
      type: OtpType.LOGIN,
      code,
      status: OtpStatus.PENDING,
      expiresAt,
    });

    const expiryMinutes = Math.round(this.getExpiryMs() / 60000);
    if (user.phone && !user.phone.startsWith('social-')) {
      await this.notificationService.sendSMS(
        user.phone,
        `Your SpiceGarden login code is: ${code}. Valid for ${expiryMinutes} minutes.`,
      );
    } else {
      await this.notificationService.sendEmail(
        user.email,
        'Your SpiceGarden Login Code',
        'd-login-otp',
        { code, expiry: `${expiryMinutes} minutes` },
      );
    }

    return { message: GENERIC_MESSAGE };
  }

  /**
   * Verify a one-time login code and issue session tokens. If the account has
   * MFA enabled, a challenge is returned instead of tokens so the second
   * factor is still enforced.
   */
  async verifyOtp(
    email: string,
    code: string,
    deviceInfo: { name: string; type: string; ip: string },
  ): Promise<OtpVerifyResult> {
    if (!email || !code) {
      throw new BadRequestException('Email and code are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const otp = await this.otpRepo.findOne({
      where: {
        userId: user.id,
        type: OtpType.LOGIN,
        status: OtpStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    if (otp.expiresAt.getTime() <= Date.now()) {
      await this.otpRepo.update(otp.id, { status: OtpStatus.EXPIRED });
      throw new UnauthorizedException('Code has expired');
    }

    // Constant-time comparison to avoid leaking timing information.
    const provided = Buffer.from(code);
    const expected = Buffer.from(otp.code);
    const matches =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (!matches) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    await this.otpRepo.update(otp.id, {
      status: OtpStatus.VERIFIED,
      verifiedAt: new Date(),
    });

    if (user.isMfaEnabled) {
      return { mfaRequired: true, email: user.email };
    }

    const { passwordHash, ...authenticatedUser } = user;
    const tokens = await this.authService.login(
      authenticatedUser as AuthenticatedUser,
      deviceInfo,
    );

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async requestDeliveryOtp(orderId: string, recipientPhone?: string, userId?: string): Promise<OtpRequestResult> {
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }

    await this.otpRepo.update(
      { orderId, type: OtpType.DELIVERY_CONFIRMATION, status: OtpStatus.PENDING },
      { status: OtpStatus.EXPIRED },
    );

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + this.getExpiryMs());

    await this.otpRepo.save({
      userId: userId || '',
      orderId,
      type: OtpType.DELIVERY_CONFIRMATION,
      code,
      status: OtpStatus.PENDING,
      expiresAt,
    });

    const expiryMinutes = Math.round(this.getExpiryMs() / 60000);
    if (recipientPhone && !recipientPhone.startsWith('social-')) {
      await this.notificationService.sendSMS(
        recipientPhone,
        `Your SpiceGarden delivery OTP is: ${code}. Valid for ${expiryMinutes} minutes.`,
      );
    }

    return { message: 'Delivery OTP generated and sent.' };
  }

  async verifyDeliveryOtp(orderId: string, code: string): Promise<{ valid: boolean }> {
    if (!orderId || !code) {
      throw new BadRequestException('Order ID and code are required');
    }

    const otp = await this.otpRepo.findOne({
      where: {
        orderId,
        type: OtpType.DELIVERY_CONFIRMATION,
        status: OtpStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired delivery code');
    }

    if (otp.expiresAt.getTime() <= Date.now()) {
      await this.otpRepo.update(otp.id, { status: OtpStatus.EXPIRED });
      throw new UnauthorizedException('Delivery code has expired');
    }

    const provided = Buffer.from(code);
    const expected = Buffer.from(otp.code);
    const matches =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (!matches) {
      throw new UnauthorizedException('Invalid or expired delivery code');
    }

    await this.otpRepo.update(otp.id, {
      status: OtpStatus.VERIFIED,
      verifiedAt: new Date(),
    });

    return { valid: true };
  }
}
