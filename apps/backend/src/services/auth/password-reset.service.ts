import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { OtpEntity, OtpType, OtpStatus } from '../../db/entities/otp.entity';
import { AuthService } from './auth.service';
import { NotificationService } from '../notifications/notification.service';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private readonly otpRepo: Repository<OtpEntity>,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  async generateOTP(): Promise<string> {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTPByEmail(email: string, otp: string): Promise<void> {
    if (!email || !otp) return;

    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!sendgridKey || sendgridKey.includes('CHANGE_ME')) {
      await this.notificationService.sendEmail(
        email,
        'Password Reset Code',
        'd-reset-template',
        { code: otp, expiry: '5 minutes' }
      );
      return;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }], subject: 'Your SpiceGarden Password Reset Code' }],
        from: { email: 'noreply@spicegarden.com' },
        content: [{ type: 'text/plain', value: `Your password reset code is: ${otp}. Valid for 5 minutes.` }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(`Failed to send email: ${String(error)}`);
    }
  }

  async sendOTPBySMS(phone: string, otp: string): Promise<void> {
    await this.notificationService.sendSMS(phone, `Your SpiceGarden password reset code is: ${otp}. Valid for 5 minutes.`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      return;
    }

    const otp = await this.generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpRepo.save({
      userId: user.id,
      type: OtpType.PASSWORD_RESET,
      code: otp,
      status: OtpStatus.PENDING,
      expiresAt,
    });

    if (user.phone) {
      await this.sendOTPBySMS(user.phone, otp);
    } else {
      await this.sendOTPByEmail(email, otp);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.otpRepo.findOne({
      where: {
        userId: user.id,
        type: OtpType.PASSWORD_RESET,
        status: OtpStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    if (!crypto.timingSafeEqual(Buffer.from(otp.code), Buffer.from(code))) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (otp.expiresAt.getTime() <= Date.now()) {
      await this.otpRepo.update(otp.id, { status: OtpStatus.EXPIRED });
      throw new UnauthorizedException('Reset code has expired');
    }

    await this.otpRepo.update(otp.id, { status: OtpStatus.VERIFIED, verifiedAt: new Date() });
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.otpRepo.findOne({
      where: {
        userId: user.id,
        type: OtpType.PASSWORD_RESET,
        status: OtpStatus.VERIFIED,
      },
      order: { verifiedAt: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    if (!crypto.timingSafeEqual(Buffer.from(otp.code), Buffer.from(code))) {
      throw new UnauthorizedException('Invalid reset code');
    }

    const passwordHash = await this.authService.hashPassword(newPassword);
    await this.userRepo.update(user.id, { passwordHash });

    await this.otpRepo.update(otp.id, { status: OtpStatus.VERIFIED });
  }
}