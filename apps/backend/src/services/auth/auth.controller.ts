import { Controller, Post, Body, ConflictException, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request } from 'express';

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
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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

  private getDeviceInfo(body: { deviceName?: string; deviceType?: string }, req: Request): DeviceInfo {
    return {
      name: body.deviceName || 'any Device',
      type: body.deviceType || 'any Type',
      ip: req.ip || '0.0.0.0',
    };
  }
}

