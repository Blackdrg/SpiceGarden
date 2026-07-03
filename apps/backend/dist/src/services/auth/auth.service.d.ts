import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { SessionEntity } from '../../db/entities/session.entity';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';
export interface AuthenticatedUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    passwordHash?: string;
}
export interface LoginTokenResponse {
    access_token: string;
    refresh_token: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly userRepo;
    private readonly sessionRepo;
    constructor(jwtService: JwtService, configService: ConfigService, userRepo: Repository<UserEntity>, sessionRepo: Repository<SessionEntity>);
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
    }): Promise<LoginTokenResponse>;
    refreshAccessToken(refreshToken: string, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<LoginTokenResponse>;
    revokeSession(refreshToken: string): Promise<void>;
    loginWithSocial(profile: {
        email: string;
        fullName: string;
        socialId: string;
        socialProvider: string;
    }): Promise<LoginTokenResponse>;
}
