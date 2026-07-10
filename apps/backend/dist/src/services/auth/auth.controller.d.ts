import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request, Response } from 'express';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';
import { NotificationService } from '../notifications/notification.service';
import { ConfigService } from '@nestjs/config';
interface LoginBody {
    email: string;
    password: string;
    deviceName?: string;
    deviceType?: string;
}
interface MfaLoginBody {
    email: string;
    code: string;
    deviceName?: string;
    deviceType?: string;
}
interface RegisterBody extends LoginBody {
    phone: string;
    fullName: string;
}
export declare class AuthController {
    private authService;
    private passwordResetService;
    private readonly userRepo;
    private notificationService;
    private configService;
    constructor(authService: AuthService, passwordResetService: PasswordResetService, userRepo: Repository<UserEntity>, notificationService: NotificationService, configService: ConfigService);
    login(body: LoginBody, req: Request, res: Response): Promise<{
        mfaRequired: boolean;
        email: string;
        access_token?: undefined;
        refresh_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
            status: UserStatus;
        };
        mfaRequired?: undefined;
        email?: undefined;
    }>;
    verifyMfaLogin(body: MfaLoginBody, req: Request, res: Response): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
            status: UserStatus;
        };
    }>;
    register(body: RegisterBody, req: Request, res: Response): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
            status: UserStatus;
        };
    }>;
    refreshToken(req: Request, res: Response): Promise<{
        refresh_token: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        revoked: boolean;
    }>;
    me(req: Request): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | undefined;
            role: UserRole;
            status: UserStatus;
            isMfaEnabled: boolean;
        };
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    verifyResetCode(body: {
        email: string;
        code: string;
    }): Promise<{
        valid: boolean;
    }>;
    resetPassword(body: {
        email: string;
        code: string;
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: Request, res: Response): Promise<void>;
    facebookAuth(): Promise<void>;
    facebookAuthCallback(req: Request, res: Response): Promise<void>;
    private getDeviceInfo;
}
export {};
