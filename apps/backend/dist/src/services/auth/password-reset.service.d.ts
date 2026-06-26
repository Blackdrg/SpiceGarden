import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { OtpEntity } from '../../db/entities/otp.entity';
import { AuthService } from './auth.service';
import { NotificationService } from '../notifications/notification.service';
export declare class PasswordResetService {
    private configService;
    private readonly userRepo;
    private readonly otpRepo;
    private authService;
    private notificationService;
    constructor(configService: ConfigService, userRepo: Repository<UserEntity>, otpRepo: Repository<OtpEntity>, authService: AuthService, notificationService: NotificationService);
    generateOTP(): Promise<string>;
    sendOTPByEmail(email: string, otp: string): Promise<void>;
    sendOTPBySMS(phone: string, otp: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    verifyResetCode(email: string, code: string): Promise<boolean>;
    resetPassword(email: string, code: string, newPassword: string): Promise<void>;
}
