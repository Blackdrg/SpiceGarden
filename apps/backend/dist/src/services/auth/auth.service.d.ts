import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MfaService } from './mfa.service';
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
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly userRepo;
    private readonly mfaService;
    private readonly sessionRepo;
    constructor(jwtService: JwtService, configService: ConfigService, userRepo: Repository<UserEntity>, mfaService: MfaService, sessionRepo: Repository<SessionEntity>);
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    createSession(userId: string, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }, refreshToken?: string): Promise<SessionEntity>;
    validateUser(email: string, pass: string): Promise<AuthenticatedUser>;
    login(user: AuthenticatedUser, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<MfaLoginTokenResponse>;
    loginWithMfa(user: AuthenticatedUser, code: string, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<MfaLoginTokenResponse>;
    refreshAccessToken(refreshToken: string, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<MfaLoginTokenResponse>;
    revokeSession(refreshToken: string): Promise<void>;
    loginWithSocial(profile: {
        email: string;
        fullName: string;
        socialId: string;
        socialProvider: string;
    }): Promise<MfaLoginTokenResponse>;
}
