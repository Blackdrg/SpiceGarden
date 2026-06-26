import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request } from 'express';
import { NotificationService } from '../notifications/notification.service';
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
export declare class AuthController {
    private authService;
    private passwordResetService;
    private readonly userRepo;
    private notificationService;
    constructor(authService: AuthService, passwordResetService: PasswordResetService, userRepo: Repository<UserEntity>, notificationService: NotificationService);
    login(body: LoginBody, req: Request): Promise<import("./auth.service").LoginTokenResponse>;
    register(body: RegisterBody, req: Request): Promise<import("./auth.service").LoginTokenResponse>;
    refreshToken(body: RefreshBody, req: Request): Promise<import("./auth.service").LoginTokenResponse>;
    logout(body: RefreshBody): Promise<{
        revoked: boolean;
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
    private getDeviceInfo;
}
export {};
