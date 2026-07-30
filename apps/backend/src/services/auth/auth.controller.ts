import { Controller, Post, Body, ConflictException, UnauthorizedException, Req, BadRequestException, Get, UseGuards, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { OtpService } from './otp.service';
import { InjectRepository, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request, Response } from 'express';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';
import { NotificationService } from '../notifications/notification.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto, MfaLoginDto, RegisterDto, RequestOtpDto, VerifyResetCodeDto, ResetPasswordDto } from './dto/auth.dto';

interface DeviceInfo {
  name: string;
  type: string;
  ip: string;
}

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string, configService: ConfigService): void {
  const sessionDurationDays = Number(configService.get<number>('SESSION_DURATION_DAYS', 30));
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
    path: '/',
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: sessionDurationDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
    private otpService: OtpService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) { }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    // If MFA is required, return a challenge instead of tokens
    if (user.isMfaEnabled) {
      return { mfaRequired: true, email: user.email };
    }

    const deviceInfo = this.getDeviceInfo(body, req);
    const tokens = await this.authService.login(user, deviceInfo);
    setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);

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

  @Post('login/verify-mfa')
  async verifyMfaLogin(@Body() body: MfaLoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.userRepo.findOneBy({ email: body.email });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const deviceInfo = this.getDeviceInfo(body, req);
    const tokens = await this.authService.loginWithMfa(user, body.code, deviceInfo);
    setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);

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

  @Post('otp')
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.otpService.requestOtp(body?.email);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: MfaLoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const deviceInfo = this.getDeviceInfo(body, req);
    const result = await this.otpService.verifyOtp(body.email, body.code, deviceInfo);

    if (result.access_token && result.refresh_token) {
      setAuthCookies(res, result.access_token, result.refresh_token, this.configService);
    }

    return result;
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
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
      const tokens = await this.authService.login(savedUser, deviceInfo);
      setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role,
          status: savedUser.status,
        },
      };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === '23505') {
        throw new ConflictException('Email or phone already registered');
      }
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as Request & { cookies?: Record<string, string | undefined> }).cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const deviceInfo = this.getDeviceInfo({}, req);
    const tokens = await this.authService.refreshAccessToken(refreshToken, deviceInfo);
    setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);

    return { refresh_token: tokens.refresh_token };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as Request & { cookies?: Record<string, string | undefined> }).cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      await this.authService.revokeSession(refreshToken);
    }
    clearAuthCookies(res);
    return { revoked: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const user = (req as Request & { user?: { id: string; email: string; fullName?: string; role: UserRole; status: UserStatus; isMfaEnabled: boolean } }).user;
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        isMfaEnabled: user.isMfaEnabled,
      },
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: RequestOtpDto) {
    if (!body.email) {
      return { message: 'If your email exists in our system, we have sent a reset code to it.' };
    }
    await this.passwordResetService.forgotPassword(body.email);
    return { message: 'If your email exists in our system, we have sent a reset code to it.' };
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: VerifyResetCodeDto) {
    if (!body.email || !body.code) {
      throw new BadRequestException('Email and code are required');
    }
    await this.passwordResetService.verifyResetCode(body.email, body.code);
    return { valid: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (!body.email || !body.code || !body.password) {
      throw new BadRequestException('Email, code, and password are required');
    }
    if (body.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    await this.passwordResetService.resetPassword(body.email, body.code, body.password);
    return { success: true, message: 'Password reset successful' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const socialUser = (req as any).user as {
      email: string;
      fullName?: string;
      displayName?: string;
      id: string;
    };
    const tokens = await this.authService.loginWithSocial({
      email: socialUser.email,
      fullName: socialUser.fullName || socialUser.displayName || '',
      socialId: socialUser.id,
      socialProvider: 'google',
    });
    setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    return;
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const socialUser = (req as any).user as {
      email: string;
      fullName?: string;
      displayName?: string;
      name?: { givenName?: string; familyName?: string };
      id: string;
    };
    const fullName = socialUser.fullName || socialUser.displayName ||
      [socialUser.name?.givenName, socialUser.name?.familyName].filter(Boolean).join(' ') ||
      '';
    const tokens = await this.authService.loginWithSocial({
      email: socialUser.email,
      fullName,
      socialId: socialUser.id,
      socialProvider: 'facebook',
    });
    setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/`);
  }

  private getDeviceInfo(body: { deviceName?: string; deviceType?: string }, req: Request): DeviceInfo {
    return {
      name: body.deviceName || 'any Device',
      type: body.deviceType || 'any Type',
      ip: req.ip || '0.0.0.0',
    };
  }
}