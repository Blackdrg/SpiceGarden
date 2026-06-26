import { Controller, Post, Body, ConflictException, UnauthorizedException, Req, BadRequestException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request } from 'express';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';
import { NotificationService } from '../notifications/notification.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

interface DeviceInfo {
  name: string;
  type: string;
  ip: string;
}

interface LoginBody {
  email: string;
  password: string;
  deviceName?: string;
  deviceType?: string;
}

interface RegisterBody extends LoginBody {
  phone: string;
  fullName: string;
}

interface RefreshBody {
  refresh_token: string;
  deviceName?: string;
  deviceType?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private notificationService: NotificationService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginBody, @Req() req: Request) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    const deviceInfo = this.getDeviceInfo(body, req);

    return this.authService.login(user, deviceInfo);
  }

  @Post('register')
  async register(@Body() body: RegisterBody, @Req() req: Request) {
    const existing = await this.userRepo.findOne({ where: { email: body.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.authService.hashPassword(body.password);
    const user = this.userRepo.create({
      email: body.email,
      phone: body.phone,
      fullName: body.fullName,
      passwordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepo.save(user);
    const deviceInfo = this.getDeviceInfo(body, req);

    return this.authService.login(savedUser, deviceInfo);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshBody, @Req() req: Request) {
    const deviceInfo = this.getDeviceInfo(body, req);
    return this.authService.refreshAccessToken(body.refresh_token, deviceInfo);
  }

  @Post('logout')
  async logout(@Body() body: RefreshBody) {
    await this.authService.revokeSession(body.refresh_token);
    return { revoked: true };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      return { message: 'If your email exists in our system, we have sent a reset code to it.' };
    }
    await this.passwordResetService.forgotPassword(body.email);
    return { message: 'If your email exists in our system, we have sent a reset code to it.' };
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    if (!body.email || !body.code) {
      throw new BadRequestException('Email and code are required');
    }
    await this.passwordResetService.verifyResetCode(body.email, body.code);
    return { valid: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; password: string }) {
    if (!body.email || !body.code || !body.password) {
      throw new BadRequestException('Email, code, and password are required');
    }
    if (body.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    await this.passwordResetService.resetPassword(body.email, body.code, body.password);
    return { success: true, message: 'Password reset successful' };
  }

  private getDeviceInfo(body: { deviceName?: string; deviceType?: string }, req: Request): DeviceInfo {
    return {
      name: body.deviceName || 'any Device',
      type: body.deviceType || 'any Type',
      ip: req.ip || '0.0.0.0',
    };
  }
}