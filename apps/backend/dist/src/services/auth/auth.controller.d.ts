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
            id: any;
            email: any;
            fullName: any;
            role: any;
            status: any;
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
            id: any;
            email: any;
            fullName: any;
            role: any;
            status: any;
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
    googleAuthCallback(req: Request, res: Response): Promise<any>;
    facebookAuth(): Promise<void>;
    facebookAuthCallback(req: Request, res: Response): Promise<any>;
    private getDeviceInfo;
}
export {};
