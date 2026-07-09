import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MfaService } from './mfa.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { SessionEntity } from '../../db/entities/session.entity';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isMfaEnabled: boolean;
  status: UserStatus;
  passwordHash?: string;
}

export interface LoginTokenResponse {
  mfaRequired?: boolean;
  access_token?: string;
  refresh_token?: string;
}
export interface MfaLoginTokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mfaService: MfaService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
  ) { }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async createSession(userId: string, deviceInfo: { name: string; type: string; ip: string }, refreshToken = '') {
    const sessionDurationDays = Number(this.configService.get<number>('SESSION_DURATION_DAYS', 30));
    const session = this.sessionRepo.create({
      userId,
      deviceName: deviceInfo.name,
      deviceType: deviceInfo.type,
      ipAddress: deviceInfo.ip,
      refreshToken,
      expiresAt: new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000),
    });
    return this.sessionRepo.save(session);
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUser> {
    if (!email || !pass) {
      throw new UnauthorizedException('Credentials required');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (await this.verifyPassword(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result as AuthenticatedUser;
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  async login(user: AuthenticatedUser, deviceInfo: { name: string; type: string; ip: string }): Promise<MfaLoginTokenResponse> {
    const payload = { email: user.email, fullName: user.fullName, sub: user.id, role: user.role, status: user.status, isMfaEnabled: user.isMfaEnabled };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(Number(this.configService.get<number>('REFRESH_TOKEN_LENGTH', 40))).toString('hex');

    await this.createSession(user.id, deviceInfo, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async loginWithMfa(user: AuthenticatedUser, code: string, deviceInfo: { name: string; type: string; ip: string }): Promise<MfaLoginTokenResponse> {
    const isCodeValid = await this.mfaService.verifyCode(user, code);

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid MFA code.');
    }

    const payload = { email: user.email, fullName: user.fullName, sub: user.id, role: user.role, status: user.status, isMfaEnabled: true };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(Number(this.configService.get<number>('REFRESH_TOKEN_LENGTH', 40))).toString('hex');

    await this.createSession(user.id, deviceInfo, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
    deviceInfo: { name: string; type: string; ip: string },
  ): Promise<MfaLoginTokenResponse> {
    const session = await this.sessionRepo.findOne({
      where: { refreshToken, isActive: true },
      relations: { user: true },
    });

    if (!session || !session.user || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const nextRefreshToken = crypto.randomBytes(Number(this.configService.get<number>('REFRESH_TOKEN_LENGTH', 40))).toString('hex');
    session.refreshToken = nextRefreshToken;
    session.lastActiveAt = new Date();
    session.deviceName = deviceInfo.name;
    session.deviceType = deviceInfo.type;
    session.ipAddress = deviceInfo.ip;
    await this.sessionRepo.save(session);

    const payload = {
      email: session.user.email,
      sub: session.user.id,
      role: session.user.role,
      status: session.user.status,
      isMfaEnabled: session.user.isMfaEnabled,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: nextRefreshToken,
    };
  }

  async revokeSession(refreshToken: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { refreshToken } });
    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    session.isActive = false;
    session.lastActiveAt = new Date();
    await this.sessionRepo.save(session);
  }

  async loginWithSocial(profile: {
    email: string;
    fullName: string;
    socialId: string;
    socialProvider: string;
  }): Promise<MfaLoginTokenResponse> {
    const normalizedEmail = profile.email.toLowerCase();
    let user = await this.userRepo.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await this.hashPassword(randomPassword);
      user = this.userRepo.create({
        email: normalizedEmail,
        fullName: profile.fullName,
        phone: `social-${profile.socialId}`,
        passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      });
      await this.userRepo.save(user);
    }

    const { passwordHash, ...authenticatedUser } = user;
    return this.login(authenticatedUser as AuthenticatedUser, {
      name: 'social',
      type: profile.socialProvider,
      ip: '0.0.0.0',
    });
  }
}
