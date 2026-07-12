import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { OtpEntity } from '../../db/entities/otp.entity';
import { NotificationService } from '../notifications/notification.service';
import { AuthService, MfaLoginTokenResponse } from './auth.service';
export interface OtpRequestResult {
    message: string;
}
export interface OtpVerifyResult extends Partial<MfaLoginTokenResponse> {
    mfaRequired?: boolean;
    email?: string;
    user?: {
        id: string;
        email: string;
        fullName: string;
        role: UserEntity['role'];
        status: UserEntity['status'];
    };
}
export declare class OtpService {
    private readonly configService;
    private readonly userRepo;
    private readonly otpRepo;
    private readonly notificationService;
    private readonly authService;
    constructor(configService: ConfigService, userRepo: Repository<UserEntity>, otpRepo: Repository<OtpEntity>, notificationService: NotificationService, authService: AuthService);
    private generateCode;
    private getExpiryMs;
    requestOtp(email: string): Promise<OtpRequestResult>;
    verifyOtp(email: string, code: string, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<OtpVerifyResult>;
}
